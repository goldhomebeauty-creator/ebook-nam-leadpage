/**
 * ENDPOINT NHẬN FORM LEAD PAGE EBOOK NÁM (bản GỘP VỀ BREVO — 02/07/2026)
 * Luồng mới: form -> đẩy contact vào Brevo list #3 NGAY (Automation #1 bắn Email 1 trong vài giây)
 *            -> ghi Sheet, đánh dấu sẵn cột P + Q để hệ cũ bỏ qua.
 * AN TOÀN: nếu đẩy Brevo LỖI -> để trống P + Q -> guiEbookTuDong gửi sách mẫu cũ
 *          và syncBrevo đồng bộ lại sau (khách không bao giờ bị bỏ rơi).
 */

var SHEET_ID = '1ChNOFlwznY2_bYxSZqFyoyEKPQpDLqArtwDYaXp7F9k';
var TAB_NAME = 'Ebook nám';
var BREVO_API_KEY = 'DAN_KEY_VAO_DAY'; // <-- anh copy dòng BREVO_API_KEY trong project "tặng ebook nám" thay vào đây
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

    // 1) Đẩy vào Brevo TRƯỚC để Email 1 chuỗi bắn ngay
    var brevoOk = addToBrevo_(email, name);

    // 2) Ghi sheet: A=thời gian, B=email, C=tên, D=sđt (giữ số 0 đầu)
    //    P (16) = chặn hệ cũ gửi mẫu cũ; Q (17) = chặn syncBrevo đồng bộ lại.
    //    Chỉ đánh dấu khi Brevo OK; lỗi thì để trống cho 2 hệ cũ lo (fallback).
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(TAB_NAME);
    var now = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
    var markP = brevoOk ? ('✔ Brevo trực tiếp ' + now) : '';
    var markQ = brevoOk ? ('✔ doPost ' + now) : '';
    sheet.appendRow([
      now, email, name, "'" + phone,
      '', '', '', '', '', '', '', '', '', '', '',
      markP, markQ
    ]);

    return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput('ERR: ' + err).setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Thêm/cập nhật contact vào Brevo list #3. Trả về true nếu thành công.
 * updateEnabled=true: khách đã có sẵn trong list #3 sẽ không bị kích hoạt chuỗi lại
 * (Automation chỉ trigger khi contact MỚI vào list — re-entry đang tắt).
 */
function addToBrevo_(email, name) {
  try {
    if (BREVO_API_KEY.indexOf('xkeysib') !== 0) return false; // chưa điền key
    var resp = UrlFetchApp.fetch('https://api.brevo.com/v3/contacts', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'api-key': BREVO_API_KEY },
      payload: JSON.stringify({
        email: email,
        attributes: { FIRSTNAME: name },
        listIds: [BREVO_LIST_ID],
        updateEnabled: true
      }),
      muteHttpExceptions: true
    });
    var code = resp.getResponseCode();
    return (code === 201 || code === 204);
  } catch (err) {
    return false;
  }
}

// Mở URL /exec bằng trình duyệt để kiểm tra deploy còn sống.
function doGet() {
  return ContentService.createTextOutput('Lead endpoint ebook nam (Brevo direct): OK').setMimeType(ContentService.MimeType.TEXT);
}
