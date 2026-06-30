/**
 * ENDPOINT NHẬN FORM LEAD PAGE EBOOK NÁM -> GHI VÀO SHEET "Ebook nám"
 * Sheet auto gửi sách (guiEbookTuDong) sẽ quét dòng mới và gửi ebook như bình thường.
 *
 * ====== CÁCH DEPLOY (anh Hoàng làm 1 lần) ======
 * 1. Đăng nhập tài khoản Google sở hữu script ebook (vikora2025) trên Chrome.
 * 2. Vào https://script.google.com -> New project (hoặc mở chung project ebook).
 * 3. Dán toàn bộ code này vào, Save.
 * 4. Deploy -> New deployment -> chọn type "Web app".
 *      - Execute as:  Me (chính anh)
 *      - Who has access:  Anyone
 *    -> Deploy -> Authorize -> copy URL dạng .../exec
 * 5. Dán URL /exec đó cho Claude (em sẽ cắm vào biến APPS_SCRIPT_URL trong index.html rồi đẩy lại).
 *
 * Lưu ý cột: A=thời gian, B=email, C=tên, D=sđt (đúng tab "Ebook nám").
 */

var SHEET_ID = '1ChNOFlwznY2_bYxSZqFyoyEKPQpDLqArtwDYaXp7F9k';
var TAB_NAME = 'Ebook nám';

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
    var name  = (data.fullname || data.name || '').toString().trim();
    var email = (data.email || '').toString().trim();
    var phone = (data.phone || '').toString().trim();

    if (!email) {
      return ContentService.createTextOutput('NO_EMAIL').setMimeType(ContentService.MimeType.TEXT);
    }

    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(TAB_NAME);
    var now = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');

    // A=thời gian, B=email, C=tên, D=sđt
    sheet.appendRow([now, email, name, phone]);

    return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput('ERR: ' + err).setMimeType(ContentService.MimeType.TEXT);
  }
}

// Cho phép mở URL bằng trình duyệt để kiểm tra deploy còn sống (hiện chữ).
function doGet() {
  return ContentService.createTextOutput('Lead endpoint ebook nam: OK').setMimeType(ContentService.MimeType.TEXT);
}
