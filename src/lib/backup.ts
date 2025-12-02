import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface BackupConfig {
  basePath: string;
  historyPath: string;
  rollingPath: string;
  protectedPath: string;
  protectedListPath: string;
  maxRollingBackups: number;
  maxProtectedBackups: number;
}

export interface BackupInfo {
  version: string;
  timestamp: string;
  path: string;
  type: "history" | "rolling" | "protected";
  size: number;
}

export class BackupManager {
  private config: BackupConfig;

  constructor() {
    const basePath = process.env.BACKUP_BASE_PATH || "./backups";

    this.config = {
      basePath,
      historyPath: path.join(basePath, "history"),
      rollingPath: path.join(basePath, "rolling"),
      protectedPath: path.join(basePath, "protected"),
      protectedListPath: path.join(basePath, "protected_backups.json"),
      maxRollingBackups: 10,
      maxProtectedBackups: 5,
    };

    this.ensureDirectories();
  }

  // 디렉토리 구조 생성
  private ensureDirectories(): void {
    const dirs = [
      this.config.basePath,
      this.config.historyPath,
      this.config.rollingPath,
      this.config.protectedPath,
    ];

    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // 보호 목록 로드
  private loadProtectedList(): string[] {
    try {
      if (fs.existsSync(this.config.protectedListPath)) {
        const content = fs.readFileSync(this.config.protectedListPath, "utf-8");
        return JSON.parse(content);
      }
    } catch (error) {
      console.error("보호 목록 로드 실패:", error);
    }
    return [];
  }

  // 보호 목록 저장
  private saveProtectedList(versions: string[]): void {
    try {
      fs.writeFileSync(
        this.config.protectedListPath,
        JSON.stringify(versions, null, 2),
      );
    } catch (error) {
      console.error("보호 목록 저장 실패:", error);
    }
  }

  // Git 아카이브 생성
  private async createGitArchive(targetPath: string): Promise<void> {
    try {
      await execAsync(
        `git archive --format=tar HEAD | tar -x -C "${targetPath}"`,
      );
    } catch (error) {
      console.error("Git 아카이브 생성 실패:", error);
      throw error;
    }
  }

  // 폴더 크기 계산
  private getFolderSize(folderPath: string): number {
    try {
      if (!fs.existsSync(folderPath)) return 0;

      let size = 0;
      const files = fs.readdirSync(folderPath);

      files.forEach((file) => {
        const filePath = path.join(folderPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          size += this.getFolderSize(filePath);
        } else {
          size += stat.size;
        }
      });

      return size;
    } catch (error) {
      console.error("폴더 크기 계산 실패:", error);
      return 0;
    }
  }

  // 백업 생성
  async createBackup(version: string): Promise<BackupInfo[]> {
    const backups: BackupInfo[] = [];
    const timestamp = new Date().toISOString();

    try {
      // 1. History 백업 (무제한 보존)
      const historyPath = path.join(this.config.historyPath, version);
      if (!fs.existsSync(historyPath)) {
        fs.mkdirSync(historyPath, { recursive: true });
        await this.createGitArchive(historyPath);

        backups.push({
          version,
          timestamp,
          path: historyPath,
          type: "history",
          size: this.getFolderSize(historyPath),
        });
      }

      // 2. Rolling 백업 (최신 10개만)
      const rollingPath = path.join(this.config.rollingPath, version);
      if (!fs.existsSync(rollingPath)) {
        fs.mkdirSync(rollingPath, { recursive: true });
        await this.createGitArchive(rollingPath);

        backups.push({
          version,
          timestamp,
          path: rollingPath,
          type: "rolling",
          size: this.getFolderSize(rollingPath),
        });

        // 오래된 rolling 백업 정리
        await this.pruneRollingBackups();
      }

      // 3. Protected 백업 (보호 목록에 있는 경우)
      const protectedList = this.loadProtectedList();
      if (protectedList.includes(version)) {
        const protectedPath = path.join(this.config.protectedPath, version);
        if (!fs.existsSync(protectedPath)) {
          fs.mkdirSync(protectedPath, { recursive: true });
          await this.createGitArchive(protectedPath);

          backups.push({
            version,
            timestamp,
            path: protectedPath,
            type: "protected",
            size: this.getFolderSize(protectedPath),
          });
        }
      }

      return backups;
    } catch (error) {
      console.error("백업 생성 실패:", error);
      throw error;
    }
  }

  // Rolling 백업 정리 (최신 10개만 유지)
  private async pruneRollingBackups(): Promise<void> {
    try {
      const rollingBackups = fs
        .readdirSync(this.config.rollingPath)
        .filter((dir) =>
          fs.statSync(path.join(this.config.rollingPath, dir)).isDirectory(),
        )
        .sort((a, b) => {
          // 버전 번호로 정렬
          const aParts = a.replace("v", "").split(".").map(Number);
          const bParts = b.replace("v", "").split(".").map(Number);

          for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            const aVal = aParts[i] || 0;
            const bVal = bParts[i] || 0;
            if (aVal !== bVal) return aVal - bVal;
          }
          return 0;
        });

      // 최신 10개를 제외한 나머지 삭제
      const toDelete = rollingBackups.slice(0, -this.config.maxRollingBackups);

      toDelete.forEach((version) => {
        const backupPath = path.join(this.config.rollingPath, version);
        fs.rmSync(backupPath, { recursive: true, force: true });
        console.log(`Rolling 백업 삭제: ${version}`);
      });
    } catch (error) {
      console.error("Rolling 백업 정리 실패:", error);
    }
  }

  // 백업 목록 조회
  async listBackups(): Promise<{
    history: BackupInfo[];
    rolling: BackupInfo[];
    protected: BackupInfo[];
  }> {
    const result = {
      history: [] as BackupInfo[],
      rolling: [] as BackupInfo[],
      protected: [] as BackupInfo[],
    };

    try {
      // History 백업 목록
      if (fs.existsSync(this.config.historyPath)) {
        const historyDirs = fs
          .readdirSync(this.config.historyPath)
          .filter((dir) =>
            fs.statSync(path.join(this.config.historyPath, dir)).isDirectory(),
          );

        result.history = historyDirs.map((version) => ({
          version,
          timestamp: fs
            .statSync(path.join(this.config.historyPath, version))
            .mtime.toISOString(),
          path: path.join(this.config.historyPath, version),
          type: "history" as const,
          size: this.getFolderSize(path.join(this.config.historyPath, version)),
        }));
      }

      // Rolling 백업 목록
      if (fs.existsSync(this.config.rollingPath)) {
        const rollingDirs = fs
          .readdirSync(this.config.rollingPath)
          .filter((dir) =>
            fs.statSync(path.join(this.config.rollingPath, dir)).isDirectory(),
          );

        result.rolling = rollingDirs.map((version) => ({
          version,
          timestamp: fs
            .statSync(path.join(this.config.rollingPath, version))
            .mtime.toISOString(),
          path: path.join(this.config.rollingPath, version),
          type: "rolling" as const,
          size: this.getFolderSize(path.join(this.config.rollingPath, version)),
        }));
      }

      // Protected 백업 목록
      if (fs.existsSync(this.config.protectedPath)) {
        const protectedDirs = fs
          .readdirSync(this.config.protectedPath)
          .filter((dir) =>
            fs
              .statSync(path.join(this.config.protectedPath, dir))
              .isDirectory(),
          );

        result.protected = protectedDirs.map((version) => ({
          version,
          timestamp: fs
            .statSync(path.join(this.config.protectedPath, version))
            .mtime.toISOString(),
          path: path.join(this.config.protectedPath, version),
          type: "protected" as const,
          size: this.getFolderSize(
            path.join(this.config.protectedPath, version),
          ),
        }));
      }

      return result;
    } catch (error) {
      console.error("백업 목록 조회 실패:", error);
      return result;
    }
  }

  // 보호 목록 관리
  async addToProtectedList(version: string): Promise<void> {
    const protectedList = this.loadProtectedList();

    if (!protectedList.includes(version)) {
      if (protectedList.length >= this.config.maxProtectedBackups) {
        throw new Error(
          `보호 목록은 최대 ${this.config.maxProtectedBackups}개까지만 가능합니다`,
        );
      }

      protectedList.push(version);
      this.saveProtectedList(protectedList);

      // Protected 백업 생성
      const protectedPath = path.join(this.config.protectedPath, version);
      if (!fs.existsSync(protectedPath)) {
        fs.mkdirSync(protectedPath, { recursive: true });
        await this.createGitArchive(protectedPath);
      }
    }
  }

  async removeFromProtectedList(version: string): Promise<void> {
    const protectedList = this.loadProtectedList();
    const index = protectedList.indexOf(version);

    if (index > -1) {
      protectedList.splice(index, 1);
      this.saveProtectedList(protectedList);

      // Protected 백업 삭제
      const protectedPath = path.join(this.config.protectedPath, version);
      if (fs.existsSync(protectedPath)) {
        fs.rmSync(protectedPath, { recursive: true, force: true });
      }
    }
  }

  // 백업 복원
  async restoreBackup(
    version: string,
    type: "history" | "rolling" | "protected" = "rolling",
  ): Promise<void> {
    let backupPath: string;

    switch (type) {
      case "history":
        backupPath = path.join(this.config.historyPath, version);
        break;
      case "rolling":
        backupPath = path.join(this.config.rollingPath, version);
        break;
      case "protected":
        backupPath = path.join(this.config.protectedPath, version);
        break;
      default:
        throw new Error("잘못된 백업 타입입니다");
    }

    if (!fs.existsSync(backupPath)) {
      throw new Error(`백업을 찾을 수 없습니다: ${version} (${type})`);
    }

    try {
      // 현재 작업 디렉토리를 백업으로 복사
      const currentDir = process.cwd();

      // 기존 파일 백업 (복원 전)
      const tempBackup = path.join(this.config.basePath, "temp_restore_backup");
      if (fs.existsSync(tempBackup)) {
        fs.rmSync(tempBackup, { recursive: true, force: true });
      }
      fs.mkdirSync(tempBackup, { recursive: true });

      // 현재 상태를 임시 백업
      await execAsync(
        `git archive --format=tar HEAD | tar -x -C "${tempBackup}"`,
      );

      // 백업에서 복원
      await execAsync(`cp -r "${backupPath}"/* "${currentDir}/"`);

      console.log(`백업 복원 완료: ${version} (${type})`);
      console.log(`임시 백업 위치: ${tempBackup}`);
    } catch (error) {
      console.error("백업 복원 실패:", error);
      throw error;
    }
  }

  // 백업 통계
  async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    historyCount: number;
    rollingCount: number;
    protectedCount: number;
    protectedList: string[];
  }> {
    const backups = await this.listBackups();
    const protectedList = this.loadProtectedList();

    const totalSize = [
      ...backups.history,
      ...backups.rolling,
      ...backups.protected,
    ].reduce((sum, backup) => sum + backup.size, 0);

    return {
      totalBackups:
        backups.history.length +
        backups.rolling.length +
        backups.protected.length,
      totalSize,
      historyCount: backups.history.length,
      rollingCount: backups.rolling.length,
      protectedCount: backups.protected.length,
      protectedList,
    };
  }

  // 백업 경로 조회
  async getBackupPath(
    version: string,
    type: "history" | "rolling" | "protected",
  ): Promise<string | null> {
    let backupPath: string;

    switch (type) {
      case "history":
        backupPath = path.join(this.config.historyPath, version);
        break;
      case "rolling":
        backupPath = path.join(this.config.rollingPath, version);
        break;
      case "protected":
        backupPath = path.join(this.config.protectedPath, version);
        break;
      default:
        return null;
    }

    return fs.existsSync(backupPath) ? backupPath : null;
  }

  // 백업 정보 조회
  async getBackupInfo(
    version: string,
    type: "history" | "rolling" | "protected",
  ): Promise<BackupInfo | null> {
    const backupPath = await this.getBackupPath(version, type);

    if (!backupPath) {
      return null;
    }

    return {
      version,
      timestamp: fs.statSync(backupPath).mtime.toISOString(),
      path: backupPath,
      type,
      size: this.getFolderSize(backupPath),
    };
  }

  // 백업 설정 업데이트
  async updateConfig(newConfig: Partial<BackupConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    this.ensureDirectories();
  }

  // 현재 설정 조회
  getConfig(): BackupConfig {
    return { ...this.config };
  }
}

// 싱글톤 인스턴스
export const backupManager = new BackupManager();
