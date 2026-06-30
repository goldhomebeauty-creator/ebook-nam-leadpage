/**
 * CHUỖI EMAIL NUÔI DƯỠNG SAU EBOOK (drip theo ngày 0,1,2,4,6,8)
 * Gửi từ tài khoản đang đăng nhập (vikora2025 - Giang).
 *
 * ====== CÁCH DEPLOY (anh Hoàng làm 1 lần) ======
 * 1. Mở script.google.com bằng tài khoản vikora2025 (chủ sheet ebook).
 *    Có thể dán vào CHUNG project với doPost lead page, hoặc tạo project mới.
 * 2. Dán toàn bộ code này, Save.
 * 3. Chạy thử 1 lần hàm "guiChuoiNuoiEbook" (bấm Run) để cấp quyền gửi mail.
 * 4. Đặt lịch tự chạy mỗi sáng: biểu tượng Đồng hồ (Triggers) -> Add Trigger
 *      - Function: guiChuoiNuoiEbook
 *      - Event source: Time-driven
 *      - Type: Day timer -> 7am to 8am
 *    -> Save. Từ đó mỗi sáng script tự quét và gửi đúng mốc ngày.
 *
 * AN TOÀN: chỉ chăm khách đăng ký TỪ ngày ONLY_AFTER trở đi (khách cũ không bị gửi).
 */

// ===== CẤU HÌNH =====
var SHEET_ID = '1ChNOFlwznY2_bYxSZqFyoyEKPQpDLqArtwDYaXp7F9k';
var TAB_NAME = 'Ebook nám';
var COL_DATE = 1;   // A = thời gian đăng ký
var COL_EMAIL = 2;  // B = email
var COL_NAME = 3;   // C = tên
var SENDER_NAME = 'Lê Thu Giang';
var TRACK_HEADER = 'NuoiStep';   // cột tự thêm để đánh dấu đã gửi tới email mấy (0..6)
var MILESTONES = [0, 1, 2, 4, 6, 8];  // mốc ngày của email 1..6
var MAX_PER_RUN = 80;            // trần gửi mỗi lần chạy (an toàn quota Gmail)

// Chỉ chăm khách đăng ký TỪ mốc này (đặt = ngày bật script). Sửa nếu cần.
var ONLY_AFTER = new Date('2026-07-01T00:00:00+07:00');

// ===== 6 EMAIL =====
var EMAILS = [
  { subject: 'Sách của chị đây rồi, Giang gửi tận tay nhé',
    body:
'Chào chị,\n\n' +
'Giang là Lê Thu Giang đây. Cảm ơn chị đã tin và để lại email cho Giang.\n\n' +
'Cuốn cẩm nang chăm sóc da nám tại nhà chị tải ở đây nhé: https://lethugiang.com/ebook\n\n' +
'Chị đọc thong thả thôi, không cần vội. Trong sách Giang viết lại tất cả những gì mình đã vỡ ra sau bao năm loay hoay với nám, để chị đỡ phải trả giá như Giang ngày xưa.\n\n' +
'Mấy hôm tới Giang sẽ ghé hộp thư của chị thêm vài lần nữa, kể chị nghe những điều quan trọng nhất mà sách chưa nói hết. Chị nhớ mở thư của Giang nha.\n\n' +
'Thương chị,\nGiang' },

  { subject: 'Năm 18 tuổi Giang không dám soi gương',
    body:
'Chào chị,\n\n' +
'Chị đọc sách tới đâu rồi ạ?\n\n' +
'Hôm nay Giang muốn kể chị nghe vì sao Giang lại đi sâu vào chuyện làn da đến vậy.\n\n' +
'Năm 18 tuổi, cái tuổi đáng lẽ rạng rỡ nhất, Giang lại quen với việc cúi mặt vì nám và mụn. Giang chạy chữa khắp nơi, dính cả kem trộn, da càng ngày càng mỏng yếu, nám bùng lên đậm hơn. Giang mất tiền, mất cả niềm tin, từng ngồi trước gương nghĩ chắc da mình hỏng thật rồi.\n\n' +
'Bước ngoặt là khi Giang thôi giao phó cho người khác, tự đi học về làn da, về khí hậu Việt Nam, gặp các chuyên gia, rồi tự thử lên chính mình.\n\n' +
'Giang kể chị nghe không phải để khoe, mà để chị tin một điều: nám lì lợm bám mãi phần nhiều không phải vì chị vụng, mà vì bấy lâu mình chăm chưa thật đúng cách thôi. Hiểu đúng rồi, mọi thứ nhẹ đi nhiều.\n\n' +
'Mai Giang nói tiếp với chị về sai lầm khiến nám càng trị càng đậm nhé.\n\n' +
'Thương chị,\nGiang' },

  { subject: '3 điều khiến nám càng trị càng đậm',
    body:
'Chào chị,\n\n' +
'Giang gặp rất nhiều chị làm đủ cách mà nám vẫn không lui, phần lớn vì 3 điều này:\n\n' +
'Một là nóng vội đổi hết loại này tới loại kia. Da chưa kịp quen đã đổi thì càng dễ kích ứng rồi sạm trở lại.\n\n' +
'Hai là bỏ quên chống nắng. Đây mới là gốc. Bôi bao nhiêu hoạt chất làm sáng mà ban ngày không che chắn thì như múc nước đổ vào rổ.\n\n' +
'Ba là dồn nhiều hoạt chất mạnh cùng lúc cho nhanh. Da có giới hạn của nó, dồn nhiều quá da châm, đỏ, rồi đậm lại.\n\n' +
'Chị thử soi xem mình có đang mắc điều nào không nhé. Trong ebook Giang có nói kỹ phần chống nắng, chị mở lại đọc kỹ chỗ đó: https://lethugiang.com/ebook\n\n' +
'Mai Giang nói với chị vì sao có những vết nám bôi mãi ngoài da vẫn không ăn thua.\n\n' +
'Thương chị,\nGiang' },

  { subject: 'Vì sao bôi kem mãi mà nám vẫn không mờ',
    body:
'Chào chị,\n\n' +
'Có một chuyện Giang muốn nói thật với chị, để chị đỡ tự trách mình.\n\n' +
'Nám không chỉ nằm ngoài da. Nhiều loại nám có gốc rễ sâu bên trong, từ nội tiết, từ năm tháng da phơi nắng tích lại. Kem bôi ngoài chạm được phần da, nhưng nửa còn lại là chuyện bên trong và là thời gian.\n\n' +
'Vậy nên trị nám đúng không phải là tìm một hũ kem thần kỳ bôi vài hôm là hết. Nó là chăm đều, dịu nhẹ, kiên nhẫn, và chọn được thứ thật sự hỗ trợ làn da chứ không bào mòn nó.\n\n' +
'Đây cũng chính là lý do Giang mất nhiều năm mới tự tay làm ra được dòng sản phẩm Giang yên tâm dùng cho chính mình và mẹ mình. Ngày mai Giang sẽ giới thiệu chị nghe, nếu chị muốn có một thứ đồng hành cùng việc chăm da mỗi tối.\n\n' +
'Thương chị,\nGiang' },

  { subject: 'Chị Hằng nhắn cho Giang lúc nửa đêm',
    body:
'Chào chị,\n\n' +
'Có một chị Giang nhớ mãi. Chị Hằng, sinh xong hai bé, nám phủ kín hai gò má, từng nhắn cho Giang lúc nửa đêm vừa ru con vừa khóc, bảo nhìn mình trong gương mà không nhận ra.\n\n' +
'Giang không hứa hẹn gì với chị ấy cả. Giang chỉ nói chị cứ chống nắng cho kỹ, chăm dịu nhẹ mỗi tối, kiên nhẫn cùng Giang. Chị ấy làm đều, thật đều.\n\n' +
'Vài tháng sau chị gửi ảnh, da sáng hơn, nám nhạt đi, và quan trọng hơn là chị cười lại được. Công đó là của chị Hằng, ở sự kiên trì của chị ấy. Giang chỉ may mắn được đồng hành một đoạn.\n\n' +
'Giang kể để chị tin rằng da mình có thể khá hơn, miễn là mình chăm đúng và đủ kiên nhẫn. Mai Giang nói với chị về thứ Giang vẫn dùng mỗi tối nhé.\n\n' +
'Thương chị,\nGiang' },

  { subject: 'Thứ Giang vẫn thoa mỗi tối, gửi chị',
    body:
'Chào chị,\n\n' +
'Mấy hôm nay Giang kể chị nghe khá nhiều về nám rồi. Hôm nay Giang giới thiệu chị thứ Giang vẫn dùng mỗi tối: kem dưỡng đêm Skin Night Cream của BA12DAYS, dòng Giang tự tay làm ra sau nhiều năm đi tìm.\n\n' +
'Giang nói thẳng để chị khỏi kỳ vọng sai. Không có hũ kem nào trị dứt nám sau vài ngày đâu chị. Skin Night Cream là thứ hỗ trợ làn da trong lúc chị chăm đều mỗi tối, giúp da được nuôi dưỡng dịu nhẹ, để hành trình của chị nhẹ nhàng và bớt đơn độc hơn. Phần công vẫn là ở sự kiên trì của chị.\n\n' +
'Chị xem kỹ thành phần, cách dùng và câu chuyện sản phẩm ở đây nhé: https://kemnam.ba12days.com\n\n' +
'Nếu chị còn băn khoăn da mình hợp không, chị cứ nhắn Giang qua Zalo, Giang tư vấn thật lòng cho chị, hợp thì dùng, chưa hợp Giang nói chị chưa nên mua: https://zalo.me/4583815288539178560\n\n' +
'Dù chị có dùng sản phẩm của Giang hay không, Giang vẫn mong chị chăm da đều và thương lấy mình. Da chị rồi sẽ ổn hơn.\n\n' +
'Thương chị,\nGiang' }
];

// ===== HÀM CHÍNH (đặt trigger Day timer cho hàm này) =====
function guiChuoiNuoiEbook() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(TAB_NAME);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var trackCol = ensureTrackColumn_(sheet);
  var today = startOfDay_(new Date());

  var dates  = sheet.getRange(2, COL_DATE, lastRow - 1, 1).getValues();
  var emails = sheet.getRange(2, COL_EMAIL, lastRow - 1, 1).getValues();
  var names  = sheet.getRange(2, COL_NAME, lastRow - 1, 1).getValues();
  var steps  = sheet.getRange(2, trackCol, lastRow - 1, 1).getValues();

  var sent = 0;
  for (var i = 0; i < dates.length; i++) {
    if (sent >= MAX_PER_RUN) break;

    var email = (emails[i][0] + '').trim();
    if (!email || email.indexOf('@') < 0) continue;

    var signup = parseDate_(dates[i][0]);
    if (!signup) continue;
    if (signup < ONLY_AFTER) continue;            // bỏ qua khách cũ

    var lastStep = parseInt(steps[i][0], 10) || 0;
    if (lastStep >= 6) continue;                  // đã xong chuỗi

    var nextStep = lastStep + 1;                  // 1..6
    var dayDiff = Math.floor((today - startOfDay_(signup)) / 86400000);
    if (dayDiff < MILESTONES[nextStep - 1]) continue;  // chưa tới mốc

    var em = EMAILS[nextStep - 1];
    try {
      GmailApp.sendEmail(email, em.subject, em.body, { name: SENDER_NAME });
      sheet.getRange(i + 2, trackCol).setValue(nextStep);
      sent++;
      Utilities.sleep(400);
    } catch (err) {
      sheet.getRange(i + 2, trackCol).setValue('lỗi B' + nextStep);
    }
  }
  Logger.log('Đã gửi ' + sent + ' email nuôi dưỡng.');
}

// ===== TIỆN ÍCH =====
function ensureTrackColumn_(sheet) {
  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  for (var c = 0; c < headers.length; c++) {
    if ((headers[c] + '').trim() === TRACK_HEADER) return c + 1;
  }
  var col = lastCol + 1;
  sheet.getRange(1, col).setValue(TRACK_HEADER);
  return col;
}

function parseDate_(v) {
  if (v instanceof Date) return v;
  var s = (v + '').trim();
  if (!s) return null;
  // dd/MM/yyyy HH:mm:ss
  var m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  var d = new Date(s);   // yyyy-MM-dd HH:mm:ss và các dạng ISO
  return isNaN(d.getTime()) ? null : d;
}

function startOfDay_(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
