import type { ExpressionId } from '@/bot/expressions'
import type { ColorId, ShapeId } from '@/bot/skins'

type Lang = 'fr' | 'en' | 'zh'

function pickLang(): Lang {
  const tag = (navigator.language ?? 'en').toLowerCase()
  if (tag.startsWith('zh')) return 'zh'
  if (tag.startsWith('fr')) return 'fr'
  return 'en'
}

const UI = {
  fr: {
    title: 'Animate Bot',
    enabled: 'Afficher le compagnon',
    shape: 'Forme',
    expression: 'Expression',
    color: 'Couleur',
    size: 'Taille',
    hint: 'Glissez pour déplacer · Cliquez pour cligner · La molette change l’humeur',
    blocked:
      'Cette page (nouvel onglet Chrome) n’accepte pas les extensions. Ouvrez un site normal (ex. baidu.com) puis actualisez.'
  },
  en: {
    title: 'Animate Bot',
    enabled: 'Show companion',
    shape: 'Shape',
    expression: 'Expression',
    color: 'Colour',
    size: 'Size',
    hint: 'Drag to move · Click to wink · Scroll wheel changes mood',
    blocked:
      'This page (Chrome new tab) blocks extensions. Open a normal website (e.g. baidu.com) and refresh.'
  },
  zh: {
    title: 'Animate Bot',
    enabled: '显示浏览器宠物',
    shape: '形状',
    expression: '表情',
    color: '颜色',
    size: '大小',
    hint: '拖动移动 · 点击眨眼 · 滚轮切换心情',
    blocked: '此页面（Chrome 新标签页）不支持扩展。请打开普通网站（如 baidu.com）并刷新页面。'
  }
} as const

const SHAPES: Record<Lang, Record<ShapeId, string>> = {
  fr: {
    cercle: 'Cercle',
    galet: 'Galet',
    squircle: 'Squircle',
    capsule: 'Capsule',
    triangle: 'Triangle',
    hexagone: 'Hexagone',
    nuage: 'Nuage',
    goutte: 'Goutte'
  },
  en: {
    cercle: 'Circle',
    galet: 'Pebble',
    squircle: 'Squircle',
    capsule: 'Capsule',
    triangle: 'Triangle',
    hexagone: 'Hexagon',
    nuage: 'Cloud',
    goutte: 'Drop'
  },
  zh: {
    cercle: '圆形',
    galet: '卵石',
    squircle: '方圆形',
    capsule: '胶囊',
    triangle: '三角',
    hexagone: '六边形',
    nuage: '云朵',
    goutte: '水滴'
  }
}

const EXPRESSIONS: Record<Lang, Record<ExpressionId, string>> = {
  fr: {
    neutre: 'Neutre',
    attentif: 'Attentif',
    surpris: 'Surpris',
    excite: 'Excité',
    heureux: 'Heureux',
    hilare: 'Hilare',
    colere: 'Colère',
    triste: 'Triste',
    effraye: 'Effrayé',
    mefiant: 'Méfiant',
    confus: 'Confus',
    curieux: 'Curieux',
    fier: 'Fier',
    timide: 'Timide',
    blase: 'Blasé',
    somnolent: 'Somnolent'
  },
  en: {
    neutre: 'Neutral',
    attentif: 'Attentive',
    surpris: 'Surprised',
    excite: 'Excited',
    heureux: 'Happy',
    hilare: 'Laughing',
    colere: 'Angry',
    triste: 'Sad',
    effraye: 'Scared',
    mefiant: 'Wary',
    confus: 'Confused',
    curieux: 'Curious',
    fier: 'Proud',
    timide: 'Shy',
    blase: 'Bored',
    somnolent: 'Sleepy'
  },
  zh: {
    neutre: '中性',
    attentif: '专注',
    surpris: '惊讶',
    excite: '兴奋',
    heureux: '开心',
    hilare: '大笑',
    colere: '生气',
    triste: '难过',
    effraye: '害怕',
    mefiant: '警惕',
    confus: '困惑',
    curieux: '好奇',
    fier: '骄傲',
    timide: '害羞',
    blase: '无聊',
    somnolent: '困倦'
  }
}

const COLORS: Record<Lang, Record<ColorId, string>> = {
  fr: {
    encre: 'Encre',
    brun: 'Brun',
    rouge: 'Rouge',
    orange: 'Orange',
    ambre: 'Ambre',
    vert: 'Vert',
    turquoise: 'Turquoise',
    bleu: 'Bleu',
    violet: 'Violet',
    rose: 'Rose',
    gris: 'Gris',
    creme: 'Crème'
  },
  en: {
    encre: 'Ink',
    brun: 'Brown',
    rouge: 'Red',
    orange: 'Orange',
    ambre: 'Amber',
    vert: 'Green',
    turquoise: 'Turquoise',
    bleu: 'Blue',
    violet: 'Purple',
    rose: 'Pink',
    gris: 'Grey',
    creme: 'Cream'
  },
  zh: {
    encre: '墨黑',
    brun: '棕色',
    rouge: '红色',
    orange: '橙色',
    ambre: '琥珀',
    vert: '绿色',
    turquoise: '青绿',
    bleu: '蓝色',
    violet: '紫色',
    rose: '粉色',
    gris: '灰色',
    creme: '米白'
  }
}

const lang = pickLang()

export const L = UI[lang]
export const shapeLabel = (id: ShapeId) => SHAPES[lang][id]
export const expressionLabel = (id: ExpressionId) => EXPRESSIONS[lang][id]
export const colorLabel = (id: ColorId) => COLORS[lang][id]
