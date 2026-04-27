export type Locale = "pt" | "en" | "zh";

export const LOCALE_FLAGS: Record<Locale, string> = {
  pt: "🇵🇹",
  en: "🇬🇧",
  zh: "🇨🇳",
};

export const LOCALE_NAMES: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  zh: "中文",
};

export const translations = {
  pt: {
    // Header
    appTitle: "AI Peak Hours Monitor",
    appSubtitle: "Descubra os horários de pico e limitações dos serviços de IA globais",
    timezoneLabel: "Fuso horário",
    autoDetected: "Detectado automaticamente",
    manualTz: "Selecionado manualmente",

    // Summary Cards
    monitoredServices: "Serviços Monitorados",
    inPeakNow: "Em Pico Agora",
    bestTime: "Melhor Horário",
    localTime: "Seu Horário Local",
    idealAINow: "IA Ideal Agora",
    idealAIDesc: "Melhor opção fora de pico",

    // Categories
    all: "Todos",
    LLMs: "LLMs",
    Research: "Pesquisa",
    Image: "Imagem",
    Video: "Vídeo",
    Writing: "Escrita",
    Coding: "Código",
    Audio: "Áudio",

    // Regions
    allRegions: "Todos",
    americas: "🇺🇸 Américas",
    europe: "🇪🇺 Europa",
    asia: "🇨🇳 Ásia",
    oceania: "🇦🇺 Oceania",
    canada: "🇨🇦 Canadá",
    india: "🇮🇳 Índia",
    luxembourg: "🇱🇺 Luxemburgo",

    // Service Card
    riskHigh: "Risco Alto",
    riskMedium: "Risco Médio",
    riskLow: "Risco Baixo",
    primaryPeak: "Pico primário",
    secondaryPeak: "Pico secundário",
    checkStatus: "Verificar Status",
    checking: "Verificando...",
    statusOperational: "Operacional",
    statusDegraded: "Degradado",
    statusOutage: "Indisponível",
    statusUnknown: "Desconhecido",
    verifiedAt: "Verificado:",

    // Heatmap
    heatmapTitle: "Mapa de Calor - Horários de Pico (24h)",
    heatmapInfo: "Este gráfico mostra quantos serviços de IA estão em horário de pico para cada hora do dia no seu fuso horário.",
    heatmapLegendHigh: "Muitos em pico",
    heatmapLegendMid: "Alguns em pico",
    heatmapLegendLow: "Poucos em pico",
    primaryPeakLabel: "Pico primário",
    secondaryPeakLabel: "Pico secundário",
    currentTimeLabel: "Hora atual",
    servicesInPeak: "serviços em pico",
    ofServices: "dos serviços",
    inPeakNowList: "Serviços atualmente em pico",
    noServicesInPeak: "Nenhum serviço em pico no momento!",
    more: "mais",
    peakServicesLabel: "Serviços em pico:",

    // Recommendation
    greatTime: "Ótimo momento para usar IA!",
    somePeak: "Alguns serviços em pico",
    manyPeak: "Muitos serviços em pico",
    greatMsg: "Agora é um ótimo momento para usar serviços de IA!",
    okayMsg: "Alguns serviços estão em pico, mas a maioria está disponível.",
    waitMsg: "Muitos serviços em pico. Considere esperar até às",
    nextGoodSlot: "Próximo bom horário:",
    inPeakLabel: "em pico",
    available: "disponíveis",

    // Filters
    filters: "Filtros:",
    searchPlaceholder: "Pesquisar serviço...",
    grid: "Grade",
    heatmap: "Mapa",
    refresh: "Atualizar",

    // Footer
    footerText: "Dados de horários de pico baseados em fusos horários dos HQs",
    autoRefresh: "Atualizado automaticamente a cada 5 minutos",
    servicesMonitored: "serviços monitorados",

    // Errors
    loadError: "Erro ao carregar dados. Tente novamente.",
    retry: "Tentar novamente",
    noServicesFound: "Nenhum serviço encontrado com os filtros atuais.",
    outOfPeak: "Fora de pico",

    // Timezone warning
    tzAutoDetected: "Fuso horário detectado automaticamente",
    tzManualWarning: "Fuso horário selecionado manualmente — os horários podem não corresponder à sua localização real",
  },
  en: {
    appTitle: "AI Peak Hours Monitor",
    appSubtitle: "Discover peak hours and limitations of global AI services",
    timezoneLabel: "Timezone",
    autoDetected: "Auto-detected",
    manualTz: "Manually selected",

    monitoredServices: "Monitored Services",
    inPeakNow: "In Peak Now",
    bestTime: "Best Time",
    localTime: "Your Local Time",
    idealAINow: "Ideal AI Now",
    idealAIDesc: "Best off-peak option",

    all: "All",
    LLMs: "LLMs",
    Research: "Research",
    Image: "Image",
    Video: "Video",
    Writing: "Writing",
    Coding: "Coding",
    Audio: "Audio",

    allRegions: "All",
    americas: "🇺🇸 Americas",
    europe: "🇪🇺 Europe",
    asia: "🇨🇳 Asia",
    oceania: "🇦🇺 Oceania",
    canada: "🇨🇦 Canada",
    india: "🇮🇳 India",
    luxembourg: "🇱🇺 Luxembourg",

    riskHigh: "High Risk",
    riskMedium: "Medium Risk",
    riskLow: "Low Risk",
    primaryPeak: "Primary peak",
    secondaryPeak: "Secondary peak",
    checkStatus: "Check Status",
    checking: "Checking...",
    statusOperational: "Operational",
    statusDegraded: "Degraded",
    statusOutage: "Outage",
    statusUnknown: "Unknown",
    verifiedAt: "Verified:",

    heatmapTitle: "Peak Hours Heatmap (24h)",
    heatmapInfo: "This chart shows how many AI services are in peak hours for each hour of the day in your timezone.",
    heatmapLegendHigh: "Many in peak",
    heatmapLegendMid: "Some in peak",
    heatmapLegendLow: "Few in peak",
    primaryPeakLabel: "Primary peak",
    secondaryPeakLabel: "Secondary peak",
    currentTimeLabel: "Current time",
    servicesInPeak: "services in peak",
    ofServices: "of services",
    inPeakNowList: "Services currently in peak",
    noServicesInPeak: "No services in peak right now!",
    more: "more",
    peakServicesLabel: "Peak services:",

    greatTime: "Great time to use AI!",
    somePeak: "Some services in peak",
    manyPeak: "Many services in peak",
    greatMsg: "Now is a great time to use AI services!",
    okayMsg: "Some services are in peak, but most are available.",
    waitMsg: "Many services in peak. Consider waiting until",
    nextGoodSlot: "Next good slot:",
    inPeakLabel: "in peak",
    available: "available",

    filters: "Filters:",
    searchPlaceholder: "Search service...",
    grid: "Grid",
    heatmap: "Map",
    refresh: "Refresh",

    footerText: "Peak hours data based on HQ timezones",
    autoRefresh: "Auto-refreshed every 5 minutes",
    servicesMonitored: "services monitored",

    loadError: "Error loading data. Please try again.",
    retry: "Try again",
    noServicesFound: "No services found with current filters.",
    outOfPeak: "Off-peak",

    tzAutoDetected: "Timezone auto-detected",
    tzManualWarning: "Timezone manually selected — times may not match your actual location",
  },
  zh: {
    appTitle: "AI 高峰时段监控",
    appSubtitle: "发现全球AI服务的高峰时段和限制",
    timezoneLabel: "时区",
    autoDetected: "自动检测",
    manualTz: "手动选择",

    monitoredServices: "监控服务数",
    inPeakNow: "当前高峰",
    bestTime: "最佳时间",
    localTime: "您的本地时间",
    idealAINow: "当前推荐AI",
    idealAIDesc: "非高峰最佳选择",

    all: "全部",
    LLMs: "大语言模型",
    Research: "研究搜索",
    Image: "图像生成",
    Video: "视频生成",
    Writing: "写作工具",
    Coding: "编程助手",
    Audio: "音频创作",

    allRegions: "全部",
    americas: "🇺🇸 美洲",
    europe: "🇪🇺 欧洲",
    asia: "🇨🇳 亚洲",
    oceania: "🇦🇺 大洋洲",
    canada: "🇨🇦 加拿大",
    india: "🇮🇳 印度",
    luxembourg: "🇱🇺 卢森堡",

    riskHigh: "高风险",
    riskMedium: "中风险",
    riskLow: "低风险",
    primaryPeak: "主高峰",
    secondaryPeak: "次高峰",
    checkStatus: "检查状态",
    checking: "检查中...",
    statusOperational: "正常运行",
    statusDegraded: "性能下降",
    statusOutage: "服务中断",
    statusUnknown: "未知",
    verifiedAt: "已验证：",

    heatmapTitle: "高峰时段热力图（24小时）",
    heatmapInfo: "此图表显示每个小时有多少AI服务处于高峰时段。",
    heatmapLegendHigh: "高峰服务多",
    heatmapLegendMid: "高峰服务中",
    heatmapLegendLow: "高峰服务少",
    primaryPeakLabel: "主高峰",
    secondaryPeakLabel: "次高峰",
    currentTimeLabel: "当前时间",
    servicesInPeak: "个服务在高峰",
    ofServices: "的服务",
    inPeakNowList: "当前高峰中的服务",
    noServicesInPeak: "目前没有服务在高峰时段！",
    more: "更多",
    peakServicesLabel: "高峰服务：",

    greatTime: "使用AI的好时机！",
    somePeak: "部分服务在高峰",
    manyPeak: "许多服务在高峰",
    greatMsg: "现在是使用AI服务的好时机！",
    okayMsg: "部分服务在高峰，但大多数可用。",
    waitMsg: "许多服务在高峰。建议等待至",
    nextGoodSlot: "下一个好时段：",
    inPeakLabel: "在高峰",
    available: "可用",

    filters: "筛选：",
    searchPlaceholder: "搜索服务...",
    grid: "网格",
    heatmap: "热图",
    refresh: "刷新",

    footerText: "高峰时段数据基于各公司总部时区",
    autoRefresh: "每5分钟自动刷新",
    servicesMonitored: "个监控服务",

    loadError: "加载数据出错，请重试。",
    retry: "重试",
    noServicesFound: "当前筛选条件下没有找到服务。",
    outOfPeak: "非高峰",

    tzAutoDetected: "时区已自动检测",
    tzManualWarning: "时区已手动选择 — 时间可能与您的实际位置不符",
  },
};

export type TranslationKey = keyof typeof translations.pt;

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] || translations.en[key] || key;
}
