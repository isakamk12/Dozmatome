function getI18nStrings() {
    if (typeof window === 'undefined') return {};
    const table = window.DOZ_I18N_STRINGS;
    return table && typeof table === 'object' ? table : {};
}
const SUPPORTED_LANGS = ['ja', 'en', 'en-GB', 'en-AU', 'fr', 'fr-CA', 'de', 'ru', 'zh-CN', 'zh-TW', 'ko'];

function normalizeLang(lang) {
    if (!lang) return 'ja';
    const raw = String(lang);
    const lowered = raw.toLowerCase();
    if (lowered.startsWith('ja')) return 'ja';
    if (lowered.startsWith('ko')) return 'ko';
    if (lowered === 'zh-cn' || lowered === 'zh_cn' || lowered === 'zh-hans' || lowered.startsWith('zh-hans-')) return 'zh-CN';
    if (lowered === 'zh-tw' || lowered === 'zh_tw' || lowered === 'zh-hant' || lowered.startsWith('zh-hant-')) return 'zh-TW';
    if (lowered.startsWith('zh')) return 'zh-CN';
    if (lowered.startsWith('ru')) return 'ru';
    if (lowered.startsWith('de')) return 'de';
    if (lowered === 'fr-ca' || lowered === 'fr_ca') return 'fr-CA';
    if (lowered.startsWith('fr')) return 'fr';
    if (lowered === 'en-gb' || lowered === 'en_gb') return 'en-GB';
    if (lowered === 'en-au' || lowered === 'en_au') return 'en-AU';
    if (lowered.startsWith('en')) return 'en';
    return 'ja';
}

function getInitialLang() {
    try {
        const saved = localStorage.getItem('doz_lang');
        if (saved) return normalizeLang(saved);
    } catch { /* ignore */ }
    // Default to Japanese unless the user explicitly selects another language.
    return 'ja';
}

let currentLang = getInitialLang();

function t(key, vars = {}) {
    const strings = getI18nStrings();
    const langTable = strings?.[currentLang] || {};
    const fallbackTable = strings?.en || {};
    let raw = langTable[key] ?? fallbackTable[key] ?? key;
    raw = String(raw);
    return raw.replace(/\{(\w+)\}/g, (_, varName) => {
        const value = vars[varName];
        return value === undefined || value === null ? `{${varName}}` : String(value);
    });
}

const LANG_LABEL_KEYS = {
    ja: 'lang.ja',
    en: 'lang.en',
    'en-GB': 'lang.en_gb',
    'en-AU': 'lang.en_au',
    fr: 'lang.fr',
    'fr-CA': 'lang.fr_ca',
    de: 'lang.de',
    ru: 'lang.ru',
    'zh-CN': 'lang.zh_cn',
    'zh-TW': 'lang.zh_tw',
    ko: 'lang.ko'
};

function updateLangSelectOptionLabels() {
    const select = document.getElementById('lang-select');
    if (!select) return;

    Array.from(select.options).forEach(option => {
        const code = option.value;
        const normalized = normalizeLang(code);
        const nativeLabel = option.getAttribute('data-native') || option.textContent || code;
        const key = LANG_LABEL_KEYS[normalized];
        const localized = key ? t(key) : nativeLabel;

        if (normalized === currentLang) {
            option.textContent = nativeLabel;
            return;
        }
        if (String(localized).trim() === String(nativeLabel).trim()) {
            option.textContent = nativeLabel;
            return;
        }
        option.textContent = `${nativeLabel} (${localized})`;
    });
}

function applyI18nToDom(root = document) {
    if (!root?.querySelectorAll) return;
    root.querySelectorAll('[data-i18n], [data-i18n-html], [data-i18n-placeholder], [data-i18n-aria-label]').forEach(el => {
        const textKey = el.getAttribute('data-i18n');
        if (textKey) el.textContent = t(textKey);

        const htmlKey = el.getAttribute('data-i18n-html');
        if (htmlKey) el.innerHTML = t(htmlKey);

        const placeholderKey = el.getAttribute('data-i18n-placeholder');
        if (placeholderKey) el.setAttribute('placeholder', t(placeholderKey));

        const ariaLabelKey = el.getAttribute('data-i18n-aria-label');
        if (ariaLabelKey) el.setAttribute('aria-label', t(ariaLabelKey));
    });
}

function setLang(lang, { rerender = true } = {}) {
    currentLang = normalizeLang(lang);
    try { localStorage.setItem('doz_lang', currentLang); } catch { /* ignore */ }

    if (typeof document !== 'undefined') {
        document.documentElement.lang = currentLang;
        document.title = t('meta.title');

        const footer = document.getElementById('footer-text');
        if (footer) footer.innerHTML = t('footer.textHtml', { year: new Date().getFullYear() });

        applyI18nToDom(document);
        updateLangSelectOptionLabels();
    }

    if (rerender && typeof render === 'function') render();
}

const DATA = {
  logs: [
    {
      day: 1,
      title: "Day 1: Genesis",
      topic: "1日目：ディアボロスの洗礼とゴミ拾いメタ",
      content: "サーバーオープン直後の大混乱。第1層ボス『ディアボロス』による絶望。そして『ゴミ釣り』という独自のレベリング文化の誕生。",
      episodes: [
        { title: "ドズル社ガチ攻略パーティー", desc: "ドズルを中心に、おんりー、トントン、チーノ、なな湖、ヒカックが集結。職業バランスを重視した完璧な布陣でスタートを切る。" },
        { title: "モノパス（チームスマイル）", desc: "シャークん、Akira、スマイル、ピヤノの4名。圧倒的なセンスでサーバー初の第1層ボス討伐を成し遂げた。" },
        { title: "チームゴミ収集（トリプルA）", desc: "まぐにぃ、はこたろー、まさのりchらが『召喚の笛』を狙ってゴミを回収。爆速レベリング手法を確立。" }
      ]
    },
    {
      day: 2,
      title: "Day 2: The Labyrinth",
      topic: "2日目：死の迷宮と雪山の暴君オーディン",
      content: "第2層の広大な迷宮に苦しむ冒険者たち。トロフィー納品が必要な『オシリス』戦。そして雪山の強敵『オーディン』との2時間に及ぶ死闘。",
      episodes: [
        { title: "「花盛りの君たちへ（#花君）」", desc: "小清水透、椎名唯華、奈羅花、ニコラ、家入ポポ、トラゾー。和気あいあいと迷路を攻略する女子＋トラゾーパーティー。" },
        { title: "神父28さんの祈り", desc: "教会に常駐し、無償で蘇生し続けるロールプレイ。多くのPTを陰から支える聖域となった。" }
      ]
    },
    {
      day: 3,
      title: "Day 3: The Great Raid",
      topic: "3日目：カジノ解禁と、18人レイドボス『ゼピュロス』",
      content: "カジノの実装によるギャンブルの狂気。最大18人で挑む『ゼピュロス』レイド。称号の色（緑・白・黄）による大規模な陣形連携。",
      episodes: [
        { title: "18人合同レイド（緑・白・黄）", desc: "叶、Kamito、たけぉ、しるこ、まさのりらの大集結。色分けによる陣形指揮で巨悪に挑む。" },
        { title: "プッシュマンの暗躍", desc: "隠しボタンの座標情報を売買するビジネスが誕生し、探索が加速した。" }
      ]
    },
    {
      day: 4,
      title: "Day 4: The Wall",
      topic: "4日目：ホワイトバスと最前線の絶望『エキドナ』",
      content: "モロクのデバフ対策として『ホワイトバス』が発見される。Lv40スキルの解放。しかし、第6層『エキドナ』という未曾有の壁が立ちはだかる。",
      episodes: []
    },
    {
      day: 5,
      title: "Day 5: The Stalemate",
      topic: "5日目：折り返し地点と、第7層の「沈黙」",
      content: "第6層ボス『エキドナ』が最大のスタッパーとして君臨。最前線は第7層に到達するも、石像と即死の猛攻により1日を通してクリア者ゼロという異常事態に。",
      episodes: [
        { title: "第6層ボスでの大スタック", desc: "スロー（鈍足）スキルの維持と、アーチャー複数編成によるヘイト管理の重要性が認識され、攻略の鍵となった。" },
        { title: "第5層大規模レイド", desc: "最大18人、フルパーティー同士が手を取り合うお祭り騒ぎ。一方でサーバーダウンなどのトラブルも発生。" },
        { title: "カジノ新要素と1.2倍お守り", desc: "『ちんちろ』解禁。50万ドズで買える経験値ブーストお守りにより、Lv60を目指すレベリングが加速。" }
      ]
    },
    {
      day: 6,
      title: "Day 6: Breaking the Storm",
      topic: "6日目：7層突破と、再編の嵐",
      content: "第7層ボス『ネメシス』の攻略法が確立され始め、ついに最前線が第8層（ミニゲームの階層）へ。難易度の上昇に伴い、チームの枠を超えた合流や、不足ジョブを補うための『傭兵』要請が本格化した。",
      episodes: [
        { title: "チームち（血）の誕生", desc: "心白てと、ゾム、あきピヨらによる合流チーム。全員の語尾に『ち』を付ける独自の結束で、過酷な攻略に挑む。" },
        { title: "ウォンテッドとハイエナ", desc: "アルランディス、たいたいらが結成。他PTの獲物を横から狙うプレイスタイルから命名されたが、その実力は一級品。" },
        { title: "ジョブ不足のパズル", desc: "ズズ、猫おじ、黒炭酸らの間で、Discord上での綿密なメンバー調整。特定のボスのために『ナイト貸します』といった交渉が裏で行われた。" }
      ]
    },
    {
      day: 7,
      title: "Day 7: The Last Ascent",
      topic: "7日目：第9層到達と、ブザービーター",
      content: "最前線が第9層へ到達。しかしボスの異常なHPの高さが壁となる。一方で、下層で詰まっているプレイヤーを上位勢が引き上げる『キャリー（お手伝い）』の文化が全域に広がった。",
      episodes: [
        { title: "チームブザービーター誕生", desc: "ドズル、ヒカックらが7層ボスにて制限時間0秒と同時にクリア。劇的な勝利からそのままチーム名となった。" },
        { title: "カジノ狂騒曲（チンチロメタ）", desc: "装備修理費のインフレにより、カジノでの金策が必須に。1000万DoZの大金を稼ぐ冒険者が続出した。" },
        { title: "MSSP救出劇", desc: "4層で詰まっていたMSSPを、さかいさんだー・しるこら高レベル勢が電撃支援。格差を超えた協力が大きな話題に。" }
      ]
    },
    {
      day: 8,
      title: "Day 8: Before the End",
      topic: "8日目：最終層『ハデス』の門、そして特別措置",
      content: "企画終了の前日。不具合により第9層ボスのクリア判定に特別措置が取られる異例の事態に。深夜までプレイ時間が延長され、Lv70〜80まで上げた強者たちが最終第10層へ足を踏み入れた。",
      episodes: [
        { title: "マニュアルゲーミング（MG）", desc: "アルランディスらが、ボスのギミックを完全にマニュアル化して効率化。統率された動きで最前線を駆け抜ける。" },
        { title: "チーム『ゴミ』の結成", desc: "ろぜっくぴん、秋雪こはくらによる女子チーム。LINEグループ名がそのまま定着した、飾らない絆の象徴。" },
        { title: "10層への絶望と期待", desc: "『最大の恐怖は4度乗り越えられる』。門に刻まれた言葉。サーバー内の全精鋭が集結する未曾未のレイドバトルの予感。" }
      ]
    },
    {
      day: 9,
      title: "Day 9: The Final Descent",
      topic: "9日目：9層の突破とレイドバトルの判明",
      content: "各チームが9層の攻略を進める中、最上階の10層が最大18人（3パーティ合同）で挑む「レイドバトル」であることが判明。深夜の攻略会議で「第1陣」「第2陣」「第3陣」などに分かれて順番に挑む方針が共有され、装備の受け渡しやレベル上げも含めて準備が進んだ。",
      i18nId: "day9",
      episodes: [
        { title: "レイドバトル判明（最大18人）", desc: "10層が「最大18人（3パーティ合同）」前提であることが共有され、各パーティが合流して大規模な攻略チームを組む流れが加速した。" },
        { title: "大攻略会議と「陣」分け", desc: "トップ層による会議が開かれ、参加者を「第1陣」「第2陣」「第3陣」などに分け、順番に10層突破を目指すサーバー全体の連携が確立された。" },
        { title: "装備貸与・レベル上げ・作戦擦り合わせ", desc: "後続も含めたクリアのため、強力装備の融通や役割調整、作戦の共通化が進み、サーバー全体が“1つの軍”として最終決戦へ備えた。" }
      ]
    },
    {
      day: 10,
      title: "Day 10: Zenith",
      topic: "10日目：10層ボス「ハデス」の討伐と完全クリア",
      content: "合同チームが10層ボス「ハデス」に挑戦。歴代ボスのギミックが入り乱れる極限の激闘の末、ついに討伐しイベントの完全クリアを達成。討伐後は記念撮影、劇場での閉会式などで9日間の冒険の余韻を分かち合い、26時の塔サーバー閉鎖、27時の街サーバー閉鎖を迎えた。",
      i18nId: "day10",
      episodes: [
        { title: "第1陣の最速クリアと支援", desc: "最前線組が最速で塔を制覇。その後は後続チームへ強力な装備を貸し出したり、助っ人として参戦する熱い支援が行われた。" },
        { title: "滑り込みブザービーター", desc: "サーバー終了直前、第3陣が残り5分でボスを討伐。劇的な滑り込みクリアでサーバー全体が歓喜に包まれた。" },
        { title: "フィナーレ（記念撮影〜閉会式）", desc: "激闘を終えたクリア組で記念撮影。26時の塔サーバー閉鎖、27時の街サーバー閉鎖へ向け、劇場に集まって閉会式を迎えたり、釣りやカジノで最後の時間を過ごした。" }
      ]
    }
  ],
  members: (typeof globalThis !== 'undefined' && Array.isArray(globalThis.DOZ_MEMBERS_DATA))
    ? globalThis.DOZ_MEMBERS_DATA
    : [
      { name: "ドズル", affiliation: "ドズル社", platform: "YouTube", status: [], role: "Adventurer", note: "DoZ参加者アーカイブ。" },
      { name: "ぼんじゅうる", affiliation: "ドズル社", platform: "YouTube", status: [], role: "Adventurer", note: "DoZ参加者アーカイブ。" },
      { name: "おんりー", affiliation: "ドズル社", platform: "YouTube", status: [], role: "Adventurer", note: "DoZ参加者アーカイブ。" },
      { name: "おらふくん", affiliation: "ドズル社", platform: "YouTube", status: [], role: "Adventurer", note: "DoZ参加者アーカイブ。" },
      { name: "おおはらMEN", affiliation: "ドズル社", platform: "YouTube", status: [], role: "Adventurer", note: "DoZ参加者アーカイブ。" }
    ],
  parties: [
    { name: "チームブザービーター", members: ["ドズル", "おんりー", "おおはらMEN", "ヒカック", "チーノ", "なな湖", "柊ツルギ"], origin: "7層突破時の劇的な結末", story: "第7層ボス戦にて、制限時間0秒と同時に討伐を完了した奇跡のチーム. その勢いで10層へ一番乗りを果たす。", anecdote: "柊ツルギ（剣君）の加入により、さらに攻撃的な布陣へと進化した。" },
    { name: "モノパス (Monopass)", members: ["シャークん", "Akira", "スマイル", "ピヤノ"], origin: "攻略最前線のパイオニア", story: "圧倒的なプレイスキルで常にトップを走り続ける4人組. 8層到達の速さは全プレイヤーを一驚させた。", anecdote: "他プレイヤーから『モノパス軍団』と一目置かれる攻略の基準点。" },
    { name: "ASADA騎士団", members: ["ハセシン", "甘狼このみ", "折咲もしゅ", "渋谷ハル"], origin: "配信者たちの結束", story: "ハセシンを中心に結成. 10層クリアを見据え、下層プレイヤーの支援（キャリー）も積極的に行う義理堅い集団。", anecdote: "『岡間バーで働いてそう』『ママさんバレー』など、仲の良すぎるいじり合いが絶えない。" },
    { name: "00界隈 (ゼロゼロ界隈)", members: ["ろぜっくぴん", "白熊つらら", "桜凛月", "アルランディス", "アステル・レダ", "夜十神封魔"], origin: "深夜の攻略コミュニティ", story: "進行度の近い精鋭が集まった混成部隊. 独自のVCルールを確立し、高難易度ギミックに対応する。", anecdote: "会話の中で自然発生した名称. 高い連携力で9層を突破した。" },
    { name: "乙カレー海賊団", members: ["カズさん", "まぐにぃ", "じゃじゃまる", "しゅうと", "かざね", "リモーネ先生"], origin: "Discordの表示名から", story: "『お疲れ』と『海賊』を掛け合わせた名称. 一時期はNPCの敵勢力と間違われるハプニングも。", anecdote: "8日目には他PTへの『騎士貸し出し』を行うなど、サーバーの守護神的存在に。" },
    { name: "ゴミ (LINEグループ名)", members: ["ろぜっくぴん", "秋雪こはく", "dtto.", "巫神こん"], origin: "仲良し4人組の自虐", story: "攻略を通じて意気投合し、作成したLINEグループ名がそのまま定着. 飾らない絆で過酷な塔を登る。", anecdote: "『私たちゴミだね』という冗談から始まった、世界一愛されるチーム名。" },
    { name: "マニュアルゲーミング (MG)", members: ["アルランディス", "宙星ぱる", "たいたい", "律可"], origin: "戦術の効率化・マニュアル化", story: "複雑なボスギミックを徹底的にマニュアル化. 論理的な攻略で、初見の壁を次りと粉砕した。", anecdote: "『オーナー』などの役職を付け、会社組織のようなノリで攻略を楽しむ。" },
    { name: "米将軍団 (コメ将軍団)", members: ["ぐちつぼ", "米将軍", "焼きパン", "しゅうと"], origin: "リーダーの命名", story: "ぐちつぼが率いるチーム. 「ワンチャンク」という候補もあったが、なぜか米将軍の名前を冠することになった。", anecdote: "高い戦闘力と独特のノリで、最終決戦の重要な戦力となった。", id: "kome" },
    { name: "朝だ騎士団", members: ["天開司", "椎名唯華", "奈羅花", "小清水透"], origin: "深い絆の象徴", story: "天開司を中心に結成. どんなジョブになろうと自分たちは「朝だ騎士団」であると誓い合う、熱い結束を見せた。", anecdote: "最後には「一旦解散。でも騎士団であったことは変わらない」と語り合った。", id: "asada" },
    { name: "釣り堀探偵事務所", members: ["蝶屋はなび", "水城なつめ", "夜乃くろむ"], origin: "釣り堀の事件解決", story: "表向きは釣り堀主、裏の顔は探偵. 釣り堀で起きた謎の事件（？）を解決したことで命名された。", anecdote: "攻略の合間の癒やしとして、多くのプレイヤーが訪れる拠点となった。", id: "detective" },
    { name: "ちんちろルーザーズ", members: ["空星きらめ", "家入ポポ", "飛良ひかり"], origin: "カジノでの大敗", story: "チンチロで大負けし、ボス戦でも運に見放されがちだったことから命名された自虐的かつ愛すべきチーム。", anecdote: "「不憫」を笑いに変えながら、最後まで10層攻略に挑み続けた。", id: "losers" },
    { name: "てぃちゃ団", members: ["リモーネ先生", "しるこ", "じらいちゃん"], origin: "先生の引率", story: "リモーネ先生（てぃちゃー）が率いる教育的（？）かつ精鋭揃いのチーム。", anecdote: "安定した立ち回りで、後続チームの大きな支えとなった。", id: "teacha" }
  ],
  bestiary: [
/*
filiation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"ハ ユン",affiliation:"参加配信者",platform:"YouTube",status:["Note: Rest"],role:"Adventurer",note:"DoZ参加者アーカイブ。 Note: Rest"},{name:"小清水透",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"クロノア",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"トラゾー",affiliation:"参加配信者",platform:"YouTube",status:["Note: NB error"],role:"Adventurer",note:"DoZ参加者アーカイブ。 Note: NB error"},{name:"渋谷ハル",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"心白てと",affiliation:"参加配信者",platform:"YouTube",status:["Note: Rest"],role:"Adventurer",note:"DoZ参加者アーカイブ。 Note: Rest"},{name:"絲依とい",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"柊ツルギ",affiliation:"参加配信者",platform:"Twitch",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"八神ツクモ",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"甘音あむ",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"日裏クロ",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"日ノ隈らん",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"しるこ",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"じらいちゃん",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"a1857",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"はこたろー",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"夜乃くろむ",affiliation:"参加配信者",platform:"YouTube",status:["Note: Rest"],role:"Adventurer",note:"DoZ参加者アーカイブ。 Note: Rest"},{name:"蝶屋はなび",affiliation:"参加配信者",platform:"YouTube",status:["Note: Rest"],role:"Adventurer",note:"DoZ参加者アーカイブ。 Note: Rest"},{name:"ぷちぷち",affiliation:"参加配信者",platform:"Twitch",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"ひなこ",affiliation:"参加配信者",platform:"Twitch",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"アルランディス",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"律可",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"アステル・レダ",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"夜十神封魔",affiliation:"参加配信者",platform:"YouTube",status:["Note: NB error"],role:"Adventurer",note:"DoZ参加者アーカイブ. Note: NB error"},{name:"羽継烏有",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"アクセル・シリオス",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"アキ・ローゼンタール",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"ヒカック",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"ぎぞく",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"鬱先生",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"トントン",affiliation:"参加配信者",platform:"Twitch",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"ゾム",affiliation:"参加配信者",platform:"Twitch",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"ショッピ",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"甘狼このみ",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"シャークん",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"Akira",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"スマイル",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"ピヤノ",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"ズズ",affiliation:"参加配信者",platform:"YouTube",status:["Note: Rest"],role:"Adventurer",note:"DoZ参加者アーカイブ. Note: Rest"},{name:"天鬼ぷるる",affiliation:"参加配信者",platform:"Twitch",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"とおこ",affiliation:"参加配信者",platform:"Twitch",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"dtto.",affiliation:"参加配信者",platform:"Twitch",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"巫神こん",affiliation:"参加配信者",platform:"Twitch",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"ろぜっくぴん",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"折咲もしゅ",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"玉餅かずよ",affiliation:"参加配信者",platform:"Twitch",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"かしわねこ",affiliation:"参加配信者",platform:"Twitch",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"秋雪こはく",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"鴉羽そら",affiliation:"参加配信者",platform:"YouTube",status:[],role:"Adventurer",note:"DoZ参加者アーカイブ。"},{name:"白熊つらら",affiliation:"参加配信者",platform:"YouTube",status:["Note: NB error"],role:"Adventurer",note:"DoZ参加者アーカイブ. Note: NB error"}],parties:[{name:"チームブザービーター",members:["ドズル","おんりー","おおはらMEN","ヒカック","チーノ","なな湖","柊ツルギ"],origin:"7層突破時の劇的な結末",story:"第7層ボス戦にて、制限時間0秒と同時に討伐を完了した奇跡のチーム. その勢いで10層へ一番乗りを果たす。",anecdote:"柊ツルギ（剣君）の加入により、さらに攻撃的な布陣へと進化した。"},{name:"モノパス (Monopass)",members:["シャークん","Akira","スマイル","ピヤノ"],origin:"攻略最前線のパイオニア",story:"圧倒的なプレイスキルで常にトップを走り続ける4人組. 8層到達の速さは全プレイヤーを一驚させた。",anecdote:"他プレイヤーから『モノパス軍団』と一目置かれる攻略の基準点。"},{name:"ASADA騎士団",members:["ハセシン","甘狼このみ","折咲もしゅ","渋谷ハル"],origin:"配信者たちの結束",story:"ハセシンを中心に結成. 10層クリアを見据え、下層プレイヤーの支援（キャリー）も積極的に行う義理堅い集団。",anecdote:"『岡間バーで働いてそう』『ママさんバレー』など、仲の良すぎるいじり合いが絶えない。"},{name:"00界隈 (ゼロゼロ界隈)",members:["ろぜっくぴん","白熊つらら","桜凛月","アルランディス","アステル・レダ","夜十神封魔"],origin:"深夜の攻略コミュニティ",story:"進行度の近い精鋭が集まった混成部隊. 独自のVCルールを確立し、高難易度ギミックに対応する。",anecdote:"会話の中で自然発生した名称. 高い連携力で9層を突破した。"},{name:"乙カレー海賊団",members:["カズさん","まぐにぃ","じゃじゃまる","しゅうと","かざね","リモーネ先生"],origin:"Discordの表示名から",story:"『お疲れ』と『海賊』を掛け合わせた名称. 一時期はNPCの敵勢力と間違われるハプニングも。",anecdote:"8日目には他PTへの『騎士貸し出し』を行うなど、サーバーの守護神的存在に。"},{name:"ゴミ (LINEグループ名)",members:["ろぜっくぴん","秋雪こはく","dtto.","巫神こん"],origin:"仲良し4人組の自虐",story:"攻略を通じて意気投合し、作成したLINEグループ名がそのまま定着. 飾らない絆で過酷な塔を登る。",anecdote:"『私たちゴミだね』という冗談から始まった、世界一愛されるチーム名。"},{name:"マニュアルゲーミング (MG)",members:["アルランディス","宙星ぱる","たいたい","律可"],origin:"戦術の効率化・マニュアル化",story:"複雑なボスギミックを徹底的にマニュアル化. 論理的な攻略で、初見の壁を次々と粉砕した。",anecdote:"『オーナー』などの役職を付け、会社組織のようなノリで攻略を楽しむ。"},{name:"米将軍団 (コメ将軍団)",members:["ぐちつぼ","米将軍","焼きパン","しゅうと"],origin:"リーダーの命名",story:"ぐちつぼが率いるチーム. 「ワンチャンク」という候補もあったが、なぜか米将軍の名前を冠することになった。",anecdote:"高い戦闘力と独特のノリで、最終決戦の重要な戦力となった。"},{name:"朝だ騎士団",members:["天開司","椎名唯華","奈羅花","小清水透"],origin:"深い絆の象徴",story:"天開司を中心に結成. どんなジョブになろうと自分たちは「朝だ騎士団」であると誓い合う、熱い結束を見せた。",anecdote:"最後には「一旦解散。でも騎士団であったことは変わらない」と語り合った。"},{name:"釣り堀探偵事務所",members:["蝶屋はなび","水城なつめ","夜乃くろむ"],origin:"釣り堀の事件解決",story:"表向きは釣り堀主、裏の顔は探偵. 釣り堀で起きた謎の事件（？）を解決したことで命名された。",anecdote:"攻略の合間の癒やしとして、多くのプレイヤーが訪れる拠点となった。"},{name:"ちんちろルーザーズ",members:["空星きらめ","家入ポポ","飛良ひかり"],origin:"カジノでの大敗",story:"チンチロで大負けし、ボス戦でも運に見放されがちだったことから命名された自虐的かつ愛すべきチーム。",anecdote:"「不憫」を笑いに変えながら、最後まで10層攻略に挑み続けた。"},{name:"てぃちゃ団",members:["リモーネ先生","しるこ","じらいちゃん"],origin:"先生の引率",story:"リモーネ先生（てぃちゃー）が率いる教育的（？）かつ精鋭揃いのチーム。",anecdote:"安定した立ち回りで、後続チームの大きな支えとなった。"}],bestiary:[
*/
        { floor: 1, name: "絶望の支配者 ディアボロス", title: "The Ruler of Despair", day: 1, gimmicks: ["吸い込みからの吹き飛ばし", "地面からの突き上げ", "魔法陣の拘束"], strategy: "初期装備不可。ヒーラー2人構成推奨。", notes: "レベリング周回の対象。" },
        { floor: 2, name: "黄金の王 オシリス", title: "The Golden Pharaoh", day: 2, gimmicks: ["宝箱ギミック5個納品", "棺桶の追跡", "スローフィールド"], strategy: "タンク固定が必須。高台安置の活用。", notes: "広大な迷宮が門番。" },
        { floor: 3, name: "雪山の暴君 オーディン", title: "Tyrant of the Snow Mountain", day: 2, gimmicks: ["氷のつらら", "馬の突進", "無敵モード"], strategy: "炎属性・毒DoTが特効。", notes: "オーディンの宝玉ドロップ。" },
        { floor: 4, name: "魔神 モロク", title: "The Purgatory Demon", day: 3, gimmicks: ["チェス駒の破壊ギミック", "広範囲マグマ攻撃", "持続不滅デバフ"], strategy: "ホワイトバス・手榴弾でデバフ対策。チェス駒の迅速な処理が鍵。", notes: "マグマ地帯の難所。" },
        { floor: 5, name: "嵐の王 ゼピュロス", title: "The Wind Raid Lord", day: 3, gimmicks: ["18人レイド制限", "50体生贄入場", "生命の樹破壊"], strategy: "18人合同軍による3面同時展開。", notes: "詳細はALLIANCES項参照。" },
        { floor: 6, name: "万魔の母 エキドナ", title: "Mother of All Monsters", day: 4, gimmicks: ["圧倒的火力", "呪いの鎖爆発", "取り巻き連動HP"], strategy: "スロー維持と徹底したヘイト管理。アーチャー複数編成が主流。", notes: "6日目時点で多くのチームが突破。" },
        { floor: 7, name: "復讐の女神 ネメシス", title: "The Goddess of Revenge", day: 5, gimmicks: ["雷属性の範囲攻撃", "職業別石像の破壊", "即死フィールド"], strategy: "自身の職の石像を迅速に壊す連携。Lv60スキルの解禁が突破口。", notes: "モノパスが世界最速突破。" },
        { floor: 8, name: "豊穣の女神 イシュタル", title: "The Goddess of Ishtar", day: 6, gimmicks: ["死のミニゲーム連続発生", "指定色の床踏み", "装備破壊ペナルティ"], strategy: "アスレチックとクイズの突破が前提。ミニゲーム失敗は全装備破壊の危機。", notes: "第8層到達の象徴として語られた。" },
        { floor: 9, name: "万魔の父 ティポン", title: "The Father of Monsters", day: 7, gimmicks: ["部位破壊（右足→左足→腕→コア）", "第2形態（イシツブテ形態）と正拳突き", "ゴロゴロ攻撃＋DPSチェック"], strategy: "本体に通らない序盤は右足を狙ってダウンを取り、露出した弱点に火力を集中。足→腕→最後にコアの順で破壊していく。第2形態では正面が危険なため側面・背後から攻撃し、ゴロゴロは最優先で回避する。", notes: "探索層の先に待つ、純粋なギミック戦の壁。" },
        { floor: 10, name: "冥府の王 ハデス", title: "The Lord of Hades", day: 10, gimmicks: ["最大18人（3PT）レイドバトル", "歴代ボス級ギミックの連発（鎖・石像DPSチェック等）", "形態変化＆合計4回の復活"], strategy: "薙ぎ払い・ギロチン級の即死を避けつつ、タンクがヘイトを固定。範囲事故の温床になるガーゴイル等の雑魚はDPSが迅速に処理し、ヒーラーは全体蘇生を惜しまず回す。無敵・蘇生のタイミング共有が勝敗を分ける。", notes: "討伐者は「塔の制覇者」などの特別称号を獲得。" }
      ],dungeon:{manifesto:[{title:"所持装備喪失",content:"強制復活時、装備1箇所を消失。"},{title:"深夜2時の強制送還",content:"全プレイヤーが街へ転送。"},{title:"レベル差補正",content:"レベル差による経験値減衰. 格上狩りが基本。"},{title:"チンチロメタ",content:"装備修理費高騰により、カジノでの金策が必須に。"}],floors:[{level:1,name:"THE BEGINNING",concept:"始まりの回廊",mobs:"スライム、ワイト等",gimmicks:[{tag:"WIND",desc:"風を読み、安全地帯へ移動。"}],notes:"初心者の登竜門。"},{level:2,name:"LABYRINTH & FARM",concept:"砂漠の迷宮 / 聖地",mobs:"神殿守り、トラップミミック",gimmicks:[{tag:"LEVELLING",desc:"トラップチェストによる無限湧き。"},{tag:"POWER",desc:"上位勢による引率レベリング。"}],notes:"レベリングの聖地。"},{level:3,name:"FROZEN WASTELAND",concept:"雪山のオープンフィールド",mobs:"氷騎士、フロストウルフ",gimmicks:[{tag:"COLD",desc:"移動速度低下の寒気。"}],notes:"ボスは氷の神殿深部。"},{level:4,name:"VOLCANIC CHESS",concept:"マグマとチェス",mobs:"フレアガルーダ等",gimmicks:[{tag:"CHESS",desc:"チェスパズル。"},{tag:"PARKOUR",desc:"命懸けのアスレチック。"}],notes:"MSSPが救出された運命の地。"},{level:5,name:"BLOOMING GARDEN",concept:"和風・四季の庭",mobs:"エキドナの子供たち",gimmicks:[{tag:"DEBUFF",desc:"持続的な生命力減少。"}],notes:"中盤の大きな壁。"},{level:6,name:"HELL'S PIT",concept:"地獄の空洞",mobs:"ケルベロス等",gimmicks:[{tag:"SACRIFICE",desc:"50体生贄誘導。"}],notes:"生贄誘導が鍵となる階層。"},{level:7,name:"JUDGEMENT HALL",concept:"雷鳴と裁きの回廊",mobs:"雷精、リベンジャー等",gimmicks:[{tag:"STATUE",desc:"職業別石像ギミック。"},{tag:"INSTANT",desc:"猶予なしの即死雷。"}],notes:"Lv60・新スキルの試金石。"},{level:8,name:"DEATH PARKOUR",concept:"黄金の遊戯場",mobs:"なし（ミニゲーム）",gimmicks:[{tag:"MINIGAME",desc:"アスレチック／だるまさんがころんだ／色踏みなど、即死ミニゲームの連続。"},{tag:"NAKED",desc:"死ぬたび耐久が削れるため、武器防具を外して挑む「全裸」が基本。"}],notes:"少しのミスで最初からやり直し。沼るほど装備が壊れるため、精神力が試される階。"},{level:9,name:"MONSTER'S NEST",concept:"怪物の巣窟",mobs:"UFO、監視ロボット等",gimmicks:[{tag:"STEALTH",desc:"見つかると送還。巡回するUFOやロボットを避けながら進む。"} ,{tag:"LAMP",desc:"迷路（1〜3階）に隠された9つの光の玉（スイッチ）を灯して扉を開く。"}],notes:"階段を登るだけでは辿り着けないスイッチも存在。落とし穴で特殊層へ移動するなど、探索と謎解きが要求される。"},{level:10,name:"THE APEX",concept:"絶望の頂",mobs:"ネロディアボロス、Lv80級ガーゴイル等",gimmicks:[{tag:"LONGPATH",desc:"段差・デコボコの激しい地形を、長い道中戦を越えて進む。"},{tag:"NEO-DIABOLOS",desc:"ボスに匹敵する強敵が道中に出現。到達前に全滅するPTも。"}],notes:"ボス部屋までが最大の関門。雑魚処理と進軍の両立が必要な、サーバー全体の総力戦。"}]}};

// Hydrate missing sections that the renderer expects.
// (These keys were present in the prior version under `don'tchenge/Dozmatome`.)
if (!DATA.raid) {
    DATA.raid = {
        title: "第5層ゼピュロス合同軍 (18人レイド)",
        meta: "死亡者の『救援NPC』機能をワープポイントとして利用するメタ戦術で集結。",
        teams: [
            { color: "white", name: "白チーム", leader: "たけぉ / スマイル", members: "たけぉ、スマイル等の少数精鋭ベース", note: "称号『お散歩大好き』等で統一。" },
            { color: "yellow", name: "黄色チーム", leader: "はこたろー / まぐにぃ", members: "はこたろー、まぐにぃ等のAAAベース", note: "称号『幸運のおすそ分け』で統一。" },
            { color: "fire", name: "炎(赤)チーム", leader: "アステル / 叶", members: "アステル、アルランディス、叶等の混成", note: "称号『万物の破壊者』で統一。" }
        ]
    };
}
if (!DATA.dungeon) DATA.dungeon = { manifesto: [], secrets: [], floors: [] };
if (!Array.isArray(DATA.dungeon.secrets)) {
    DATA.dungeon.secrets = [
        { place: "釣り場裏", info: "隠しボタン1" },
        { place: "塔の裏", info: "隠しボタン2" },
        { place: "劇場裏", info: "隠しボタン3" },
        { place: "実家裏", info: "隠しボタン4" },
        { place: "初期スポ家裏", info: "隠しボタン5" }
    ];
}

let currentView = 'story';

  function render() {
      const container = document.getElementById('main-content');
      if (!container) return;
  
      container.innerHTML = '';
      window.scrollTo(0, 0);
  
      try {
          if (currentView === 'story') renderStory(container);
          else if (currentView === 'members') renderMembers(container);
          else if (currentView === 'parties') renderParties(container);
          else if (currentView === 'dungeon') renderDungeon(container);
          else if (currentView === 'bestiary') renderBestiary(container);
          else if (currentView === 'logs') renderLogs(container);
      } catch (err) {
          console.error('[DoZ] render failed:', err);
          container.innerHTML = `
              <div class="section-wrapper">
                  <div class="chapter-header reveal">
                      <span class="chapter-num">ERROR</span>
                      <h2 class="section-title">表示エラー</h2>
                  </div>
                  <div class="narrative-box reveal">
                      <p class="narrative-text">このページのデータ構造が壊れている可能性があります。コンソールのエラーを確認してください。</p>
                  </div>
              </div>
          `;
      }
  
      try {
          initObserver();
      } catch (err) {
          console.error('[DoZ] initObserver failed:', err);
          document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
      }
  }

function renderStory(container) {
    container.innerHTML = `
        <div class="section-wrapper">
            <header class="hero-section reveal">
                <span class="chapter-num">${t('story.chapter')}</span>
                <h1 class="glow-text">DOOM or ZENITH</h1>
                <p class="subtitle italic" style="letter-spacing: 5px; color: var(--ink-light);">${t('story.archiveSubtitle')}</p>
                <div class="hero-actions">
                    <button class="next-chapter-btn" onclick="switchView('logs')"><i class="fa-solid fa-feather-pointed"></i>${t('story.openLogs')}</button>
                    <button class="btn-secondary" onclick="switchView('bestiary')">${t('story.openBestiary')}</button>
                </div>
            </header>
            <section class="reveal" style="margin-bottom: 8rem;">
                <div class="narrative-box">
                    <p class="narrative-text">
                        ${t('story.narrativeHtml')}
                    </p>
                </div>
            </section>
            <div class="next-phase-footer reveal">
                <button class="next-chapter-btn" onclick="switchView('members')">
                    ${t('story.toMembers')} <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;
}

function renderMembers(container) {
    container.innerHTML = `
        <div class="section-wrapper">
            <div class="chapter-header reveal">
                <span class="chapter-num">${t('members.chapter')}</span>
                <h2 class="section-title">${t('members.title')}</h2>
            </div>
            <div class="search-container reveal">
                <input type="text" id="m-search" class="premium-search" placeholder="${t('members.searchPlaceholder')}">
            </div>
            <div class="book-grid" id="m-list">
                ${DATA.members.map(m => `
                    <div class="book3d-container reveal">
                        <div class="book3d">
                            <div class="book-front">
                                <div class="platform-icon ${m.platform.toLowerCase()}">
                                    <i class="fa-brands fa-${m.platform.toLowerCase()}"></i>
                                </div>
                                <div class="book-cover-content">
                                    <i class="fa-solid fa-scroll"></i>
                                    <h3>${m.name}</h3>
                                    <span style="font-size: 0.8rem; color: var(--gold);">${m.affiliation}</span>
                                </div>
                            </div>
                            <div class="book-inside">
                                <div class="book-page-content">
                                    <h4>${t('members.profileData')}</h4>
                                    <p><b>${t('members.platform')}:</b> ${m.platform}</p>
                                    <div style="margin-top: 10px;">
                                        ${m.status.map(s => `
                                            <span class="status-badge ${s.includes('error') ? 'status-error' : 'status-rest'}">
                                                ${s.replace('Note: ', '')}
                                            </span>
                                        `).join('')}
                                    </div>
                                    <p style="margin-top: 15px; font-size: 0.85rem; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 10px;">${m.note}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="next-phase-footer reveal">
                <button class="next-chapter-btn" onclick="switchView('parties')">
                    ${t('members.toParties')} <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;
    setupSearch();
}

function renderParties(container) {
    container.innerHTML = `
        <div class="section-wrapper">
            <div class="chapter-header reveal">
                <span class="chapter-num">${t('parties.chapter')}</span>
                <h2 class="section-title">${t('parties.title')}</h2>
            </div>

            <div class="party-grid">
                ${DATA.parties.map(p => `
                    <div class="party-scroll reveal">
                        <span class="chapter-num">${p.origin}</span>
                        <h3 class="party-name">${p.name}</h3>
                        <div class="party-members">
                            ${p.members.map(m => `<span class="member-tag">${m}</span>`).join('')}
                        </div>
                        <p class="narrative-text" style="font-size: 0.95rem;">${p.story}</p>
                        <div class="anecdote-box">${p.anecdote}</div>
                    </div>
                `).join('')}
            </div>

            <div class="raid-section reveal">
                <h3 style="font-family: 'Cinzel'; text-align: center; font-size: 2rem;">${t('parties.greatRaid')}</h3>
                <p style="text-align: center; font-style: italic; margin-top: 1rem; color: var(--gold);">${DATA.raid.meta}</p>
                <div class="raid-roster">
                    ${DATA.raid.teams.map(team => `
                        <div class="raid-team ${team.color}">
                            <h4>${team.name}</h4>
                            <p style="font-size: 0.8rem; margin-bottom: 10px; color: var(--gold);">${t('parties.leader')}: ${team.leader}</p>
                            <p style="font-size: 0.85rem; line-height: 1.6;">${team.members}</p>
                            <p style="margin-top: 15px; font-size: 0.75rem; opacity: 0.7;"><b>${t('parties.identifier')}:</b> ${team.note}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="next-phase-footer reveal">
                <button class="next-chapter-btn" onclick="switchView('dungeon')">
                    ${t('parties.toDungeon')} <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;
}

function renderBestiary(container) {
    container.innerHTML = `
        <div class="section-wrapper">
            <div class="chapter-header reveal"><span class="chapter-num">${t('bestiary.chapter')}</span><h2 class="section-title">${t('bestiary.title')}</h2></div>
            <div class="acronym-reveal-box reveal">
                <p style="font-family: 'Cormorant Garamond'; letter-spacing: 4px; margin-bottom: 1rem;">${t('bestiary.decodedArchive')}</p>
                <div class="acronym-display"><span>D</span><span>O</span><span>O</span><span>M</span></div>
                <p style="margin-top: 1rem; color: var(--gold);">Diabolos // Osiris // Odin // Moloch</p>
            </div>
            <div class="bestiary-list">
                ${DATA.bestiary.map(b => `
                    <div class="bestiary-scroll reveal ${b.floor === 6 ? 'echidna-corrupted' : (b.floor === 7 ? 'nemesis-storm' : (b.floor === 8 ? 'quiz-golden' : ''))}">
                        <div class="boss-header">
                            <div><span class="chapter-num">${t('bestiary.floor', { floor: b.floor })}</span><h3>${highlightInitial(b.name, b.floor <= 4)}</h3><p class="subtitle italic" style="color: var(--ink-red); text-transform: uppercase;">${b.title}</p></div>
                            <div class="boss-id-wrap"><div style="font-family: 'Cormorant Garamond'; font-size: 0.9rem;">${t('bestiary.day', { day: b.day })}</div><div style="font-size: 0.8rem; margin-top: 5px;">${t('bestiary.statusArrested')}</div></div>
                        </div>
                        <div class="boss-meta-grid">
                            <div><h4 style="margin-bottom: 1rem; border-bottom: 1px solid rgba(0,0,0,0.1);">${t('bestiary.gimmicks')}</h4><ul class="gimmick-list">${b.gimmicks.map(g => `<li>${g}</li>`).join('')}</ul></div>
                            <div><h4 style="margin-bottom: 1rem; border-bottom: 1px solid rgba(0,0,0,0.1);">${t('bestiary.research')}</h4><div class="strategy-note">${b.strategy}</div><p style="margin-top: 1.5rem; font-size: 0.9rem; color: var(--ink-light);"><b>${t('bestiary.archives')}:</b> ${b.notes}</p></div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="next-phase-footer reveal">
                <button class="next-chapter-btn" onclick="switchView('logs')">${t('bestiary.toLogs')} <i class="fa-solid fa-arrow-right"></i></button>
            </div>
        </div>
    `;
}

function renderDungeon(container) {
    container.innerHTML = `
        <div class="section-wrapper">
            <div class="chapter-header reveal"><span class="chapter-num">${t('dungeon.chapter')}</span><h2 class="section-title">${t('dungeon.title')}</h2></div>
            <div class="grid-2col reveal" style="margin-bottom: 4rem;">
                <div class="manifest-box"><h4>${t('dungeon.survivalRules')}</h4><ul style="list-style: none;">${DATA.dungeon.manifesto.map(m => `<li><b style="color: var(--ink-red);">■ ${m.title}</b><br>${m.content}</li>`).join('')}</ul></div>
                <div class="manifest-box"><h4>${t('dungeon.citySecrets')}</h4><ul style="list-style: none;">${DATA.dungeon.secrets.map(s => `<li><i class="fa-solid fa-key" style="color: var(--gold);"></i> <b>${s.place}</b>: ${s.info}</li>`).join('')}</ul><div class="secret-stamp">${t('dungeon.confidential')}</div></div>
            </div>
            <div class="dungeon-reports">
                ${DATA.dungeon.floors.map(f => `
                    <div class="dungeon-blueprint reveal">
                        <div class="floor-badge">${t('dungeon.floor', { floor: f.level })}</div><h3>${f.name}</h3><p style="font-style: italic; color: var(--ink-red); margin-bottom: 2rem;">${t('dungeon.concept')}: ${f.concept}</p>
                        <div class="grid-2col">
                            <div><h4 style="font-size: 1rem;">${t('dungeon.detectedMobs')}</h4><p style="font-size: 0.9rem;">${f.mobs}</p><h4 style="font-size: 1rem;">${t('dungeon.identifiedGimmicks')}</h4>${f.gimmicks.map(g => `<div><span class="gimmick-tag">${g.tag}</span><p style="font-size: 0.85rem;">${g.desc}</p></div>`).join('')}</div>
                            <div><h4 style="font-size: 1rem;">${t('dungeon.surveyorsNotes')}</h4><div class="strategy-note">${f.notes}</div></div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="next-phase-footer reveal">
                <button class="next-chapter-btn" onclick="switchView('bestiary')">${t('dungeon.toBestiary')} <i class="fa-solid fa-arrow-right"></i></button>
            </div>
        </div>
    `;
}

  function renderLogs(container) {
      const logs = Array.isArray(DATA.logs) ? [...DATA.logs].sort((a, b) => (a?.day ?? 0) - (b?.day ?? 0)) : [];
      container.innerHTML = `
          <div class="section-wrapper">
              <div class="chapter-header reveal"><span class="chapter-num">${t('logs.chapter')}</span><h2 class="section-title">${t('logs.title')}</h2></div>
              <div class="log-list">
                  ${logs.map(log => {
                      const tTitle = log.i18nId ? t(`data.logs.${log.i18nId}.title`) : log.title;
                      const tTopic = log.i18nId ? t(`data.logs.${log.i18nId}.topic`) : log.topic;
                      const tContent = log.i18nId ? t(`data.logs.${log.i18nId}.content`) : log.content;
                      
                      const displayTitle = (tTitle === `data.logs.${log.i18nId}.title`) ? log.title : tTitle;
                      const displayTopic = (tTopic === `data.logs.${log.i18nId}.topic`) ? log.topic : tTopic;
                      const displayContent = (tContent === `data.logs.${log.i18nId}.content`) ? log.content : tContent;

                      return `
                      <div class="log-card reveal">
                          <h3>Vol. ${log.day}: ${displayTitle}</h3>
                          <p style="margin-bottom: 2rem; font-weight: 500;">${displayTopic}</p>
                          <p class="narrative-text">${displayContent}</p>
                          ${log.episodes.length > 0 ? `<div class="episode-list">${log.episodes.map(e => `<div class="episode-item"><strong>${e.title}</strong><p style="font-size: 0.95rem; color: var(--ink-light);">${e.desc}</p></div>`).join('')}</div>` : ''}
                      </div>`;
                  }).join('')}
              </div>
              <div class="next-phase-footer reveal"><button class="next-chapter-btn" onclick="switchView('story')">${t('logs.backToPrologue')} <i class="fa-solid fa-rotate-left"></i></button></div>
          </div>
      `;
  }

function highlightInitial(name, active) { return active ? `<span class="doom-letter">${name.charAt(0)}</span>${name.slice(1)}` : name; }
function setupSearch() { const s = document.getElementById('m-search'); if (s) s.addEventListener('input', e => { const v = e.target.value.toLowerCase(); document.querySelectorAll('.book3d-container').forEach(c => c.style.display = c.innerText.toLowerCase().includes(v) ? 'block' : 'none'); }); }
  function initObserver() {
      if (typeof IntersectionObserver === 'undefined') {
          document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
          return;
      }
      const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }), { threshold: 0.1 });
      document.querySelectorAll('.reveal').forEach(el => o.observe(el));
  }

window.switchView = (v) => {
    currentView = v;
    document.querySelectorAll('.nav-links .nav-link').forEach(b => b.classList.toggle('active', b.dataset.view === v));
    render();
};

function setupInkStroke() {
    const canvas = document.createElement('canvas'); canvas.id = 'inkCanvas'; document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d'); let width = window.innerWidth, height = window.innerHeight;
    canvas.height = height; canvas.width = width;
    window.addEventListener('resize', () => { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; });
    let points = []; const MAX_AGE = 40;
    window.addEventListener('mousemove', (e) => { points.push({ x: e.clientX, y: e.clientY, age: 0 }); });
    function drawInk() {
        ctx.clearRect(0, 0, width, height); points.forEach(p => p.age++);
        if (points.length > 1) {
            ctx.lineJoin = 'round'; ctx.lineCap = 'round';
            for (let i = 1; i < points.length; i++) {
                const pt = points[i], prevPt = points[i - 1]; const dist = Math.hypot(pt.x - prevPt.x, pt.y - prevPt.y);
                if (dist > 100) continue; const alpha = Math.max(0, 1 - (pt.age / MAX_AGE));
                ctx.beginPath(); ctx.moveTo(prevPt.x, prevPt.y); ctx.lineTo(pt.x, pt.y);
                ctx.strokeStyle = `rgba(26, 21, 16, ${alpha * 0.4})`; ctx.lineWidth = Math.max(0.1, 4 * alpha); ctx.stroke();
            }
        }
        points = points.filter(p => p.age <= MAX_AGE); requestAnimationFrame(drawInk);
    }
    drawInk();
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-links .nav-link').forEach(b => b.onclick = () => switchView(b.dataset.view));

    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener('change', () => setLang(langSelect.value));
    }
    setLang(currentLang, { rerender: false });

    setupInkStroke(); render();
});
