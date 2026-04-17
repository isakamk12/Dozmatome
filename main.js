const I18N_STRINGS = (typeof window !== 'undefined' && window.DOZ_I18N_STRINGS) ? window.DOZ_I18N_STRINGS : {};
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
    return normalizeLang((typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'ja');
}

let currentLang = getInitialLang();

function t(key, vars = {}) {
    const langTable = I18N_STRINGS?.[currentLang] || {};
    const fallbackTable = I18N_STRINGS?.en || {};
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
    system: {
        title: "Doom or Zenith - Full Archive",
        lore: "Dozel Corp. MMORPG Event 'DoZ'. 150 streamers unite to conquer a 10-floor tower.",
        jobs: [
            { type: "Combat", name: "Knight", desc: "高い防御力と生存能力を持つ前線の壁。ヘイト管理が7層ボス等の攻略に不可欠。" },
            { type: "Combat", name: "Wizard", desc: "火力職。スロー魔法による足止めが上位層で極めて重要に。" },
            { type: "Combat", name: "Healer", desc: "味方の支援役。リザレクションに加え、上位層ではデバフ解除の重要性が増大。" },
            { type: "Combat", name: "Archer", desc: "遠距離狙撃手。スキル『スロー』の付与が6層以降の必須条件となっている。" },
            { type: "Combat", name: "Monk", desc: "素早い連撃。ギミックの相性により6日目時点で『受難』と呼ばれるほどの苦境に。" },
            { type: "Combat", name: "Rogue", desc: "隠密アタッカー。覚醒後の火力は高いが、立ち回りに高い技術を要する。" }
        ]
    },
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
            topic: "6日目：7層突破と、モンクの受難", 
            content: "第7層ボス『ネメシス』の攻略法が確立。ついに最前線が第8層（ミニゲームの階層）へ。一方で物理近接職、特にモンクには冬の時代が訪れる。",
            episodes: [
                { title: "第7層ボス『ネメシス』討伐", desc: "石像破壊ギミックの解明と、絶え間ないレベリングによるステータス暴力で、モノパスを筆頭に突破チームが続出。" },
                { title: "モンクの転職ラッシュ", desc: "ギミック相性の悪さから『モンクの受難』が話題に。ナイトやアーチャーへ転職し、攻略に最適化した構成への再編が進む。" },
                { title: "第8層：ミニゲームの試練", desc: "辿り着いた第8層はこれまでと一変。クイズなどの特殊ギミックが待ち受け、一時の休息と新たな困惑を与える。" }
            ]
        }
    ],
    members: [
        { "name": "ドズル", "affiliation": "ドズル社", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "ぼんじゅうる", "affiliation": "ドズル社", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "おんりー", "affiliation": "ドズル社", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "おらふくん", "affiliation": "ドズル社", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "おおはらMEN", "affiliation": "ドズル社", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "ネコおじ", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: NB error"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: NB error" },
        { "name": "赤髪のとも", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "あきピヨ", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "福井のカズさん", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "さかいさんだー", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "まぐにぃ", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: NB error"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: NB error" },
        { "name": "メッス", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "まろ", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: NB error"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: NB error" },
        { "name": "アマル", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: Rest"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: Rest" },
        { "name": "AlphaAzur", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: Rest"], "role": "Adventurer", "note": "DoZ参加者アーカイブ. Note: Rest" },
        { "name": "rpr", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "おなつのにびたし", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "Kamito", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "KAWAIICLUB", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "ギルくん", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "金豚きょー", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "黒炭酸", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "けっつん", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "じゃじゃまる", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "しょぼすけ", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "しろまんた", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "げんぴょん", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "たらこ", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "んそめ", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "ごんかね", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "緑色(みどりくん)", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "だいだら", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "たけぉ", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: NB error"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: NB error" },
        { "name": "ちーの", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "茶々茶", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: NB error"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: NB error" },
        { "name": "天開司", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "トナカイト(ヘンディー)", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "なな湖", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: Rest"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: Rest" },
        { "name": "ニコラ･クラエス", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "寧々丸", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "のばまん", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "ハセシン", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: Rest"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: Rest" },
        { "name": "ぴくと", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "日向まる", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "ひょう太朗", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "28", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "まさのりch", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "marunnn", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "みつき", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "最高コーラ", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "ゆふな", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "猫麦とろろ", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "宙星ぱる", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "天唄サウ", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "U者", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "ラメリィ", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "Rio", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "リモーネ先生", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "れいか", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "和央パリン", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "春雨麗女", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "りもこん", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "しゅうと", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "かざね", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "FB777", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "KIKKUN-MK-II", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "あろまほっと", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "eoheoh", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "たいたい", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "歌広場淳", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "米将軍", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: NB error"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: NB error" },
        { "name": "チョコブランカ", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: Rest"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: Rest" },
        { "name": "ぐちつぼ", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "焼きパン", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "島村シャルロット", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: NB error"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: NB error" },
        { "name": "堰代ミコ", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "柚原いづみ", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "飛良ひかり", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "家入ポポ", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "日向ましゅ", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: NB error"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: NB error" },
        { "name": "幽音しの", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: Rest"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: Rest" },
        { "name": "羽流鷲りりり", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: Rest"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: Rest" },
        { "name": "叶", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "鷹宮リオン", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: Rest"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: Rest" },
        { "name": "桜凛月", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "空星きらめ", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "ハ ユン", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: Rest"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: Rest" },
        { "name": "小清水透", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "クロノア", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "トラゾー", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: NB error"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: NB error" },
        { "name": "渋谷ハル", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "心白てと", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: Rest"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: Rest" },
        { "name": "絲依とい", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "柊ツルギ", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "八神ツクモ", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "甘音あむ", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "日裏クロ", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "日ノ隈らん", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "しるこ", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "じらいちゃん", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "a1857", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "はこたろー", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "夜乃くろむ", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: Rest"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: Rest" },
        { "name": "蝶屋はなび", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: Rest"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: Rest" },
        { "name": "ぷちぷち", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "ひなこ", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "アルランディス", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "律可", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "アステル・レダ", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "夜十神封魔", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: NB error"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: NB error" },
        { "name": "羽継烏有", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "アクセル・シリオス", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "アキ・ローゼンタール", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "ヒカック", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "ぎぞく", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "鬱先生", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "トントン", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "ゾム", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "ショッピ", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "甘狼このみ", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "シャークん", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "Akira", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "スマイル", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "ピヤノ", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "ズズ", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: Rest"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: Rest" },
        { "name": "天鬼ぷるる", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "とおこ", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "dtto.", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "巫神こん", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "ろぜっくぴん", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "折咲もしゅ", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "玉餅かずよ", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "かしわねこ", "affiliation": "参加配信者", "platform": "Twitch", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "秋雪こはく", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "鴉羽そら", "affiliation": "参加配信者", "platform": "YouTube", "status": [], "role": "Adventurer", "note": "DoZ参加者アーカイブ。" },
        { "name": "白熊つらら", "affiliation": "参加配信者", "platform": "YouTube", "status": ["Note: NB error"], "role": "Adventurer", "note": "DoZ参加者アーカイブ。 Note: NB error" }
    ],
    parties: [
        { name: "モノパス (チームスマイル)", members: ["シャークん", "Akira", "スマイル", "ピヤノ"], origin: "事前結成・少数精鋭", story: "全サーバーで最初に第1層ボスを討伐した伝説の4人組。", anecdote: "徹底した役割分担とプレイスキルで頭角を現した。" },
        { name: "ドズル社ガチ攻略組", members: ["ドズル", "おんりー", "トントン", "チーノ", "なな湖", "ヒカック"], origin: "ドズルによるスカウト", story: "1000年を生きる大魔導士なな湖らをオーディションで選抜した最強パーティー。", anecdote: "開始直後、ヒカックが迷子になり茶々茶チームに預けられるハプニングも。" },
        { name: "ブザービーター", members: ["島村シャルロット", "絲依とい", "ヘンディー", "ショッピ", "レイカ", "ケッツン"], origin: "助っ人合流による結成", story: "全6職業が揃った奇跡のバランス。劇的な勝利から命名。", anecdote: "層に合わせた柔軟な職業変更で戦い抜いた。" },
        { name: "頑張るブラザーズ", members: ["夜十神封魔", "羽継烏有", "marunnn", "AlphaAzur", "ぼんじゅうる", "柚原いづみ"], origin: "ボス前での命名", story: "ホロスターズ、ドズル社、NeoPorteが混ざり合った明るい混成部隊。", anecdote: "突入直前のノリでチーム名が決定した。" },
        { name: "トリプルA (ゴミ拾い組)", members: ["まぐにぃ", "はこたろー", "まさのりch", "じゃじゃまる", "かしわねこ", "ラメリィ"], origin: "独自のメタプレイ戦略", story: "他者の『ゴミ』をアイテムに変え、爆速レベリングを行う異端の集団。", anecdote: "召喚の笛を独占し、安全地帯で敵を呼び出し続けた効率厨の極み。" },
        { name: "#花君 (花盛りの君たちへ)", members: ["小清水透", "椎名唯華", "奈羅花", "ニコラ・クラエス", "家入ポポ", "トラゾー"], origin: "偶然の出会い", story: "女子＋トラゾーによる仲良し攻略組。応援タグ『#花君WIN』で高い人気を博した。", anecdote: "和気あいあいとした実況スタイルが特徴。" },
        { name: "小賢しい戦術部隊", members: ["アマル", "ぼんじゅうる", "夜十神封魔", "柚原いづみ", "羽流鷲りりり", "marunnn"], origin: "リスク管理の徹底", story: "1人だけを残して全員が装備を脱いでデスし、アイテム消失を最小限に抑える戦法を採用。", anecdote: "過酷なデスペナルティに対するシステム的な回答。" }
    ],
    raid: {
        title: "第5層ゼピュロス合同軍 (18人レイド)",
        meta: "死亡者の『救援NPC』機能をワープポイントとして利用するメタ戦術で集結。",
        teams: [
            { color: "white", name: "白チーム", leader: "たけぉ / スマイル", members: "たけぉ、スマイル等の少数精鋭ベース", note: "称号『お散歩大好き』等で統一。" },
            { color: "yellow", name: "黄色チーム", leader: "はこたろー / まぐにぃ", members: "はこたろー、まぐにぃ等のAAAベース", note: "称号『幸運のおすそ分け』で統一。" },
            { color: "fire", name: "炎(赤)チーム", leader: "アステル / 叶", members: "アステル、アルランディス、叶等の混成", note: "称号『万物の破壊者』で統一。" }
        ]
    },
    bestiary: [
        { floor: 1, name: "絶望の支配者 ディアボロス", title: "The Ruler of Despair", day: 1, gimmicks: ["吸い込みからの吹き飛ばし", "地面からの突き上げ", "魔法陣の拘束"], strategy: "初期装備不可。ヒーラー2人構成推奨。", notes: "レベリング周回の対象。" },
        { floor: 2, name: "黄金の王 オシリス", title: "The Golden Pharaoh", day: 2, gimmicks: ["宝箱ギミック5個納品", "棺桶の追跡", "スローフィールド"], strategy: "タンク固定が必須。高台安置の活用。", notes: "広大な迷宮が門番。" },
        { floor: 3, name: "雪山の暴君 オーディン", title: "Tyrant of the Snow Mountain", day: 2, gimmicks: ["氷のつらら", "馬の突進", "無敵モード"], strategy: "炎属性・毒DoTが特効。", notes: "オーディンの宝玉ドロップ。" },
        { floor: 4, name: "煉獄 of Purgatory", day: 3, gimmicks: ["回復減衰デバフ", "雑魚召喚(回復阻止)", "隕石落下"], strategy: "ホワイトバス・手榴弾で対策。", notes: "チェスパズルの後。" },
        { floor: 5, name: "嵐の王 ゼピュロス", title: "The Wind Raid Lord", day: 3, gimmicks: ["18人レイド制限", "50体生贄入場", "生命の樹破壊"], strategy: "18人合同軍による3面同時展開。", notes: "詳細はALLIANCES項参照。" },
        { floor: 6, name: "万魔の母 エキドナ", title: "Mother of All Monsters", day: 4, gimmicks: ["圧倒的火力", "呪いの鎖爆発", "取り巻き連動HP"], strategy: "スロー維持と徹底したヘイト管理。アーチャー複数編成が主流。", notes: "6日目時点で多くのチームが突破。" },
        { floor: 7, name: "復讐の女神 ネメシス", title: "The Goddess of Revenge", day: 5, gimmicks: ["雷属性の範囲攻撃", "職業別石像の破壊", "即死フィールド"], strategy: "自身の職の石像を迅速に壊す連携。Lv60スキルの解禁が突破口。", notes: "モノパスが世界最速突破。" },
        { floor: 8, name: "知識の守護者 クイズマスター", title: "The Riddle Sentinel", day: 6, gimmicks: ["4択クイズ", "ミニゲーム", "反射神経試練"], strategy: "知識の共有と協力。戦闘以外の能力が試される。", notes: "一時のレクリエーション階層。" }
    ],
    dungeon: {
        manifesto: [
            { title: "所持装備喪失", content: "強制復活時、装備1箇所を消失。" },
            { title: "深夜2時の強制送還", content: "全プレイヤーが街へ転送。" },
            { title: "レベル差補正", content: "レベル差による経験値減衰。" },
            { title: "ログアウト・リセット", content: "ログアウト時は街から再開。" }
        ],
        floors: [
            { level: 1, name: "THE GENESIS", concept: "一本道チュートリアル", mobs: "スライム、ワイト等", gimmicks: [{ tag: "DEPTH", desc: "奥に進むほどLv上昇。" }], notes: "初心者の狩場。" },
            { level: 2, name: "LABYRINTH", concept: "砂漠の迷宮", mobs: "神殿守り等", gimmicks: [{ tag: "KEYS", desc: "多色の鍵集め。"}, { tag: "TRAP", desc: "罠チェスト(赤留め具)。" }, { tag: "EYE", desc: "目の壁(不視移動)。"}], notes: "マッピング必須。" },
            { level: 3, name: "FROZEN", concept: "雪山のオープンフィールド", mobs: "氷騎士等", gimmicks: [{ tag: "ROUTE", desc: "外周走破が正解。" }], notes: "ボスは氷の神殿。" },
            { level: 4, name: "VOLCANO", concept: "マグマとチェス", mobs: "フレアガルーダ等", gimmicks: [{ tag: "CHESS", desc: "万丈の試練。"}, { tag: "MAGMA", desc: "スニーク無効化。"}], notes: "キャラコン必須の崖登り。" },
            { level: 5, name: "FOUR SEASONS", concept: "和風四季エリア", mobs: "レアモブ『経験値』", gimmicks: [{ tag: "RAID", desc: "12-18人合同必須。"}], notes: "五重の塔が目印。" },
            { level: 6, name: "HELLSCAPE", concept: "地獄の空洞", mobs: "ケルベロス等", gimmicks: [{ tag: "SACRIFICE", desc: "50体生贄誘導。"}], notes: "不気味な半熟卵。魔の6層と呼ばれる。" },
            { level: 7, name: "TEMPEST", concept: "雷鳴と裁きの回廊", mobs: "雷精、リベンジャー等", gimmicks: [{ tag: "STATUE", desc: "職別の石像ギミック。"}, { tag: "BOLT", desc: "不可避の雷撃。"}], notes: "5日目の沈黙を呼んだ難関。" },
            { level: 8, name: "ENTERTAINMENT", concept: "黄金の遊戯場", mobs: "なし(平和？)", gimmicks: [{ tag: "QUIZ", desc: "死の4択。"}, { tag: "GAME", desc: "一発勝負のミニゲーム。"}], notes: "カジノとは別のギャンブル感。" }
        ],
        secrets: [
            { place: "釣り場裏", info: "隠しボタン1" },
            { place: "塔の裏", info: "隠しボタン2" },
            { place: "劇場裏", info: "隠しボタン3" },
            { place: "実家裏", info: "隠しボタン4" },
            { place: "初期スポ家裏", info: "隠しボタン5" }
        ]
    }
};

let currentView = 'story';

function render() {
    const container = document.getElementById('main-content');
    container.innerHTML = '';
    window.scrollTo(0, 0);

    if (currentView === 'story') renderStory(container);
    else if (currentView === 'members') renderMembers(container);
    else if (currentView === 'parties') renderParties(container);
    else if (currentView === 'dungeon') renderDungeon(container);
    else if (currentView === 'bestiary') renderBestiary(container);
    else if (currentView === 'logs') renderLogs(container);

    initObserver();
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
    container.innerHTML = `
        <div class="section-wrapper">
            <div class="chapter-header reveal"><span class="chapter-num">${t('logs.chapter')}</span><h2 class="section-title">${t('logs.title')}</h2></div>
            <div class="log-list">
                ${DATA.logs.map(log => `
                    <div class="log-card reveal"><h3>Vol. ${log.day}: ${log.title}</h3><p style="margin-bottom: 2rem; font-weight: 500;">${log.topic}</p><p class="narrative-text">${log.content}</p>
                    ${log.episodes.length > 0 ? `<div class="episode-list">${log.episodes.map(e => `<div class="episode-item"><strong>${e.title}</strong><p style="font-size: 0.95rem; color: var(--ink-light);">${e.desc}</p></div>`).join('')}</div>` : ''}</div>
                `).join('')}
            </div>
            <div class="next-phase-footer reveal"><button class="next-chapter-btn" onclick="switchView('story')">${t('logs.backToPrologue')} <i class="fa-solid fa-rotate-left"></i></button></div>
        </div>
    `;
}

function highlightInitial(name, active) { return active ? `<span class="doom-letter">${name.charAt(0)}</span>${name.slice(1)}` : name; }
function setupSearch() { const s = document.getElementById('m-search'); if (s) s.addEventListener('input', e => { const v = e.target.value.toLowerCase(); document.querySelectorAll('.book3d-container').forEach(c => c.style.display = c.innerText.toLowerCase().includes(v) ? 'block' : 'none'); }); }
function initObserver() { const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }), { threshold: 0.1 }); document.querySelectorAll('.reveal').forEach(el => o.observe(el)); }

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
