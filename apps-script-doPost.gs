/**
 * ENDPOINT NHẬN FORM LEAD PAGE EBOOK NÁM (bản GỘP VỀ BREVO — 02/07/2026)
 * Luồng mới: form -> ghi Sheet -> đẩy contact vào Brevo list #3 NGAY LẬP TỨC
 *            -> Automation #1 tự bắn Email 1 (chuỗi 6 email) trong vài giây.
 * Hệ 1 (guiEbookTuDong gửi mẫu cũ) sẽ BỎ QUA các dòng này vì cột P đã được đánh dấu sẵn.
 *
 * ====== CÁCH ÁP DỤNG (anh Hoàng làm trên tài khoản vikora2025) ======
 * 1. Mở đúng project Apps Script "leadpage nám" (project đang chứa doPost cũ).
 * 2. Xoá code cũ, dán toàn bộ file này vào, Save.
 * 3. ĐIỀN BREVO_API_KEY bên dưới: mở project "tặng ebook nám" (chứa hàm syncBrevo),
 *    copy giá trị BREVO_API_KEY trong code đó, dán vào giữa 2 dấu nháy.
 * 4. Deploy -> "Quản lý các tùy chọn triển khai" (Manage deployments) -> ✏️ Chỉnh sửa
 *    -> Version: "Phiên bản mới" (New version) -> Deploy.
 *    ⚠️ PHẢI làm kiểu "Edit -> New version" để GIỮ NGUYÊN URL /exec.
 *    (Nếu lỡ tạo New deployment = URL mới -> phải báo Claude cắm lại vào index.html.)
 * 5. Test: điền form với 1 email chưa từng dùng -> phải nhận Email 1 "Sách của chị đây rồi..."
 *    từ "Lê Thu Giang" trong ~1 phút, và KHÔNG nhận mẫu cũ từ vikora2025.
 */

var SHEET_ID = '1ChNOFlwznY2_bYxSZqFyoyEKPQpDLqArtwDYaXp7F9k';
var TAB_NAME = 'Ebook nám';
var BREVO_API_KEY = 'DAN_KEY_VAO_DAY'; // <-- copy từ code syncBrevo (project "tặng ebook nám")
var BREVO_LIST_ID = 3; // list "Khách Ebook Nám #3"

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
    var name  = (data.fullname || data.name || '').toString().trim();
    var email = (data.email || '').toString().trim().toLowerCase();
    var phone = (data.phone || '').toString().trim();

    if (!email) {
      return ContentService.createTextOutput('NO_EMAIL').setMimeType(ContentService.MimeType.TEXT);
    }

    // 1) Đẩy vào Brevo TRƯỚC (để khách nhận Email 1 chuỗi ngay cả khi ghi sheet lỗi)
    var brevoResult = addToBrevo(email, name, phone);

    // 2) Ghi sheet: A=thời gian, B=email, C=tên, D=sđt (dạng chữ, giữ số 0 đầu)
    //    ... P (cột 16) = đánh dấu sẵn để guiEbookTuDong KHÔNG gửi mẫu cũ cho dòng này.
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(TAB_NAME);
    var now = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
    sheet.appendRow([
      now, email, name, "'" + phone,
      '', '', '', '', '', '', '', '', '', '', '',
      '✔ Brevo trực tiếp ' + now + ' (' + brevoResult + ')'
    ]);

    return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput('ERR: ' + err).setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Thêm/cập nhật contact vào Brevo list #3.
 * updateEnabled=true: khách cũ đã có trong list #3 sẽ KHÔNG bị kích hoạt chuỗi lại
 * (Automation chỉ trigger khi contact MỚI được thêm vào list — re-entry đang tắt).
 */
function addToBrevo(email, name, phone) {
  try {
    var payload = {
      email: email,
      attributes: { FIRSTNAME: name },
      listIds: [BREVO_LIST_ID],
      updateEnabled: true
    };
    var resp = UrlFetchApp.fetch('https://api.brevo.com/v3/contacts', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'api-key': BREVO_API_KEY },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    var code = resp.getResponseCode();
    if (code === 201) return 'Brevo: tạo mới';
    if (code === 204) return 'Brevo: cập nhật/đã có';
    return 'Brevo lỗi ' + code + ': ' + resp.getContentText().slice(0, 120);
  } catch (err) {
    return 'Brevo exception: ' + err;
  }
}

// Mở URL /exec bằng trình duyệt để kiểm tra deploy còn sống.
function doGet() {
  return ContentService.createTextOutput('Lead endpoint ebook nam (Brevo direct): OK').setMimeType(ContentService.MimeType.TEXT);
}
