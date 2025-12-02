// 이메일 서명 템플릿

export function getEmailSignature(): string {
  return `
    <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #e5e7eb; font-family: 'Noto Sans JP', 'Hiragino Sans', 'Meiryo', sans-serif;">
      <div style="text-align: center; color: #1f2937;">
        <h3 style="margin: 0 0 10px 0; font-size: 20px; font-weight: bold; color: #2563eb;">
          MalMoi韓国語教室
        </h3>
        <p style="margin: 8px 0; font-size: 14px; color: #6b7280; font-style: italic;">
          スマートな韓国語学習を始めましょう
        </p>
        <div style="margin-top: 20px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <div style="margin: 8px 0;">
            <strong style="color: #374151;">📧 メール:</strong>
            <a href="mailto:office@hanguru.school" style="color: #2563eb; text-decoration: none; margin-left: 8px;">
              office@hanguru.school
            </a>
          </div>
          <div style="margin: 8px 0;">
            <strong style="color: #374151;">📞 電話:</strong>
            <a href="tel:090-6327-3043" style="color: #2563eb; text-decoration: none; margin-left: 8px;">
              090-6327-3043
            </a>
          </div>
          <div style="margin: 8px 0;">
            <strong style="color: #374151;">📍 住所:</strong>
            <span style="color: #4b5563; margin-left: 8px;">
              大阪府富田林市喜志町５丁目１−２　SAMURAI BLD　４D
            </span>
          </div>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
          このメールは自動送信されています。
        </p>
      </div>
    </div>
  `;
}

export function getEmailSignaturePlain(): string {
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MalMoi韓国語教室
スマートな韓国語学習を始めましょう

📧 メール: office@hanguru.school
📞 電話: 090-6327-3043
📍 住所: 大阪府富田林市喜志町５丁目１−２　SAMURAI BLD　４D

このメールは自動送信されています。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `;
}


