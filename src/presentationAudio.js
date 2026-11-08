const cue = (profile, caption, music = '', musicUrl = '', sourceUrl = '', afterNarration = null) => ({
  profile,
  caption,
  music,
  musicUrl,
  sourceUrl,
  afterNarration,
});

const CUES = Object.freeze({
  'hanh-trinh-1911': cue('harbor', 'Sóng nước, thuyền neo và vải buồm trong âm cảnh bến cảng.'),
  'yeu-sach-1919': cue('paper', 'Giấy tờ, máy chữ và căn phòng làm việc.'),
  'tours-1920': cue('assembly', 'Tiếng phòng họp và giấy tờ, được dựng lại.'),
  'lien-xo-1923': cue('radio', 'Nhiễu sóng phát thanh và âm nền phòng lưu trữ.'),
  'thanh-nien-1925': cue('printing', 'Nhịp máy in và giấy báo.'),
  'duong-kach-menh-1927': cue('classroom', 'Lớp học, phấn bảng và trang sách.'),
  'hoi-nghi-1930': cue('assembly', 'Không gian cuộc họp và hồ sơ giấy.'),
  'cuong-linh-1930': cue('paper', 'Văn kiện được lật mở và đặt xuống.'),
  'phong-trao-1930': cue('crowd', 'Âm thanh đám đông được tái dựng, không lời.'),
  'dai-hoi-i-1935': cue('assembly', 'Tiếng phòng họp và giấy tờ, được dựng lại.'),
  'tro-ve-1941': cue('forest', 'Gió núi và không gian ngoài trời yên tĩnh.'),
  'viet-minh-1941': cue('forest-radio', 'Gió rừng hòa với tín hiệu phát thanh xa.'),
  'thang-tam-1945': cue('crowd-rise', 'Đám đông dần dâng lên trong không gian thành phố.', 'Mười chín tháng Tám · Xuân Oanh', `${import.meta.env?.BASE_URL || '/'}audio/features/august-1945.audio`, 'https://vov.vn/van-hoa/muoi-chin-thang-tam-post1319809.vov'),
  'doc-lap-1945': cue('silence', 'Khoảng lặng dành cho lời đọc Tuyên ngôn Độc lập.', '', '', '', {
    title: 'Lời đọc Tuyên ngôn Độc lập · Hồ Chí Minh',
    url: `${import.meta.env?.BASE_URL || '/'}audio/features/declaration-1945.audio`,
    sourceUrl: 'https://hochiminh.vn/audio/ho-chi-minh-chu-tich-lam-thoi-nuoc-viet-nam-dan-chu-cong-hoa-doc-ban-tuyen-ngon-doc-lap-ngay-2-9-1945-tai-quang-truong-1',
    duration: null,
    kind: 'speech',
    note: 'Bản thu lại sau năm 1954, không phải âm thanh hiện trường buổi lễ.',
  }),
  'so-bo-1946': cue('diplomacy', 'Phòng họp, giấy tờ và micro.'),
  'ngoai-giao-1950': cue('shortwave', 'Tín hiệu phát thanh mở rộng ra xa.'),
  'bien-gioi-1950': cue('mountain', 'Gió núi và nhịp bước được tái dựng.'),
  'dai-hoi-ii-1951': cue('assembly', 'Không gian đại hội giữa chiến khu.'),
  'dien-bien-1954': cue('march-rise', 'Nhịp kéo pháo dần mở thành hợp âm chiến thắng.', 'Hò kéo pháo · Hoàng Vân', `${import.meta.env?.BASE_URL || '/'}audio/features/dien-bien-1954.audio`, 'https://www.hoangvan.org/ca-khuc/ho-keo-phao-3'),
  'geneve-1954': cue('diplomacy', 'Tiếng phòng họp, giấy tờ và máy ảnh.'),
  'dai-hoi-iii-1960': cue('assembly', 'Tiếng phòng họp và giấy tờ, được dựng lại.'),
  'mau-than-1968': cue('tet-radio', 'Không khí Tết xa dần, tín hiệu phát thanh ngắt quãng.'),
  'paris-1973': cue('diplomacy', 'Tiếng phòng họp, giấy tờ và máy ảnh.'),
  'mua-xuan-1975': cue('victory-rise', 'Thông tin chiến thắng mở ra một chủ đề âm nhạc mới.', 'Như có Bác trong ngày đại thắng · Phạm Tuyên', `${import.meta.env?.BASE_URL || '/'}audio/features/victory-1975.audio`, 'https://bcdcnt.net/bai-hat/nhu-co-bac-trong-ngay-dai-thang-7534.html'),
  'thong-nhat-1976': cue('ceremony', 'Không gian hội trường và âm hưởng trang trọng.'),
  'dai-hoi-iv-1976': cue('assembly', 'Không gian đại hội và hồ sơ giấy.'),
  'tim-toi-1979': cue('paper', 'Giấy tờ chính sách và nhịp làm việc trầm.'),
  'khoan-100-1981': cue('field', 'Gió đồng và nhịp lao động được tái dựng.'),
  'doi-moi-1986': cue('market-rise', 'Nhịp sống đời thường dần trở nên sôi động.'),
  'cuong-linh-1991': cue('paper', 'Văn kiện được lật mở trong âm nền tĩnh.'),
  'asean-1995': cue('global', 'Tiếng trò chuyện hội nghị và máy ảnh, được dựng lại.'),
  'dai-hoi-viii-1996': cue('assembly', 'Tiếng phòng họp và giấy tờ, được dựng lại.'),
  'wto-2007': cue('global', 'Tiếng trò chuyện hội nghị và máy ảnh, được dựng lại.'),
  'cuong-linh-2011': cue('paper', 'Trang văn kiện và âm nền hiện đại, tiết chế.'),
  'dai-hoi-xii-2016': cue('assembly', 'Tiếng phòng họp và giấy tờ, được dựng lại.'),
  'dai-hoi-xiii-2021': cue('city-rise', 'Âm thanh thành phố hôm nay và một chủ đề hướng về phía trước.'),
});

export function getPresentationAudioCue(eventId) {
  const result = CUES[eventId] || cue('silence', '');
  const passage = {
    'thang-tam-1945': { climax: 29.8, end: 69.7 },
    'dien-bien-1954': { climax: 73.44, end: 100 },
    'mua-xuan-1975': { climax: 25.82, end: 41.1 },
  }[eventId];
  if (result.musicUrl) return { ...result, afterNarration: {
    title: result.music, url: result.musicUrl, sourceUrl: result.sourceUrl,
    ...passage, duration: passage.end - passage.climax, kind: 'song',
  }};
  return result;
}
