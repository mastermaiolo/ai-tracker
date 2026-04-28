#!/usr/bin/env python3
"""
Guia de Deploy: GitHub + Vercel para AI Peak Hours Monitor
"""
import sys, os

# ━━ Color Palette (auto-generated) ━━
from reportlab.lib import colors
PAGE_BG       = colors.HexColor('#f6f6f5')
SECTION_BG    = colors.HexColor('#f2f1f0')
CARD_BG       = colors.HexColor('#e9e8e6')
TABLE_STRIPE  = colors.HexColor('#efeeec')
HEADER_FILL   = colors.HexColor('#756d56')
COVER_BLOCK   = colors.HexColor('#696046')
BORDER        = colors.HexColor('#d3cfc4')
ICON          = colors.HexColor('#94824b')
ACCENT        = colors.HexColor('#1e7693')
ACCENT_2      = colors.HexColor('#55b655')
TEXT_PRIMARY   = colors.HexColor('#151513')
TEXT_MUTED     = colors.HexColor('#7f7d75')
SEM_SUCCESS   = colors.HexColor('#518863')
SEM_WARNING   = colors.HexColor('#9f7f3e')
SEM_ERROR     = colors.HexColor('#b35148')
SEM_INFO      = colors.HexColor('#516e8c')

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm, mm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, Image, Flowable, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Font registration
pdfmetrics.registerFont(TTFont('SarasaMonoSC', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('SarasaMonoSC-Bold', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSerif', '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSerif-Bold', '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSans', '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSans-Bold', '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSansMono', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSansMono-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf'))

registerFontFamily('LiberationSerif', normal='LiberationSerif', bold='LiberationSerif-Bold')
registerFontFamily('LiberationSans', normal='LiberationSans', bold='LiberationSans-Bold')
registerFontFamily('SarasaMonoSC', normal='SarasaMonoSC', bold='SarasaMonoSC-Bold')
registerFontFamily('DejaVuSansMono', normal='DejaVuSansMono', bold='DejaVuSansMono-Bold')

# Install font fallback for mixed content
_scripts = '/home/z/my-project/skills/pdf/scripts'
if _scripts not in sys.path:
    sys.path.insert(0, _scripts)
from pdf import install_font_fallback
install_font_fallback()

PAGE_W, PAGE_H = A4
MARGIN = 1.8 * cm

# ━━ Styles ━━
body_font = 'LiberationSans'
heading_font = 'LiberationSans'
code_font = 'DejaVuSansMono'

styles = getSampleStyleSheet()

sH1 = ParagraphStyle('H1', fontName=heading_font, fontSize=20, leading=28,
    textColor=ACCENT, spaceBefore=18, spaceAfter=10)
sH2 = ParagraphStyle('H2', fontName=heading_font, fontSize=15, leading=22,
    textColor=HEADER_FILL, spaceBefore=14, spaceAfter=8)
sH3 = ParagraphStyle('H3', fontName=heading_font, fontSize=12, leading=18,
    textColor=TEXT_PRIMARY, spaceBefore=10, spaceAfter=6)
sBody = ParagraphStyle('Body', fontName=body_font, fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, wordWrap='CJK')
sBodyJust = ParagraphStyle('BodyJust', fontName=body_font, fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY)
sCode = ParagraphStyle('Code', fontName=code_font, fontSize=9, leading=14,
    textColor=SEM_INFO, backColor=CARD_BG, leftIndent=12, rightIndent=12,
    spaceBefore=4, spaceAfter=4, borderPadding=6)
sMuted = ParagraphStyle('Muted', fontName=body_font, fontSize=9, leading=14,
    textColor=TEXT_MUTED)
sStep = ParagraphStyle('Step', fontName=heading_font, fontSize=11, leading=17,
    textColor=ACCENT, spaceBefore=8, spaceAfter=4)
sTip = ParagraphStyle('Tip', fontName=body_font, fontSize=9.5, leading=15,
    textColor=SEM_SUCCESS, leftIndent=12, rightIndent=12, backColor=colors.HexColor('#e8f5e9'),
    borderPadding=8, spaceBefore=6, spaceAfter=6)
sWarn = ParagraphStyle('Warn', fontName=body_font, fontSize=9.5, leading=15,
    textColor=SEM_WARNING, leftIndent=12, rightIndent=12, backColor=colors.HexColor('#fff8e1'),
    borderPadding=8, spaceBefore=6, spaceAfter=6)
sBullet = ParagraphStyle('Bullet', fontName=body_font, fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, leftIndent=24, bulletIndent=12, wordWrap='CJK')
sNumBullet = ParagraphStyle('NumBullet', fontName=body_font, fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, leftIndent=24, bulletIndent=12, wordWrap='CJK')

# Table styles
sTH = ParagraphStyle('TH', fontName=heading_font, fontSize=10, leading=14,
    textColor=colors.white, alignment=TA_CENTER)
sTC = ParagraphStyle('TC', fontName=body_font, fontSize=9.5, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, wordWrap='CJK')
sTCCenter = ParagraphStyle('TCCenter', fontName=body_font, fontSize=9.5, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER, wordWrap='CJK')

def make_table(header, rows, col_widths=None):
    """Create a styled table."""
    available = PAGE_W - 2*MARGIN
    if not col_widths:
        n = len(header)
        col_widths = [available / n] * n
    else:
        total = sum(col_widths)
        if total < available * 0.85:
            scale = (available * 0.92) / total
            col_widths = [w * scale for w in col_widths]

    data = [[Paragraph(f'<b>{h}</b>', sTH) for h in header]]
    for row in rows:
        data.append([Paragraph(str(c), sTC) for c in row])

    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        bg = colors.white if i % 2 == 1 else TABLE_STRIPE
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

def code_block(code):
    """Render a code block."""
    lines = code.strip().split('\n')
    formatted = '<br/>'.join([line.replace(' ', '&nbsp;').replace('<', '&lt;').replace('>', '&gt;') for line in lines])
    return Paragraph(formatted, sCode)

def step_header(num, text):
    return Paragraph(f'<b>Passo {num}: {text}</b>', sStep)

def tip_box(text):
    return Paragraph(f'DICA: {text}', sTip)

def warn_box(text):
    return Paragraph(f'ATENCAO: {text}', sWarn)

def bullet(text):
    return Paragraph(f'<bullet>&bull;</bullet>{text}', sBullet)

def numbered(num, text):
    return Paragraph(f'<bullet>{num}.</bullet>{text}', sNumBullet)

def hr():
    return HRFlowable(width="100%", thickness=0.5, color=BORDER, spaceAfter=8, spaceBefore=8)

# ━━ Build Document ━━
output_path = '/home/z/my-project/download/Guia_Deploy_GitHub_Vercel.pdf'

doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    leftMargin=MARGIN, rightMargin=MARGIN,
    topMargin=MARGIN, bottomMargin=MARGIN,
    title='Guia de Deploy: GitHub + Vercel - AI Peak Hours Monitor',
    author='Z.ai',
    creator='Z.ai',
)

story = []

# ═══════════════════════════════════════════════════════════════
# CAPA (Cover)
# ═══════════════════════════════════════════════════════════════
story.append(Spacer(1, 80))
story.append(Paragraph('<b>GUIA DE DEPLOY</b>', ParagraphStyle('CoverTitle',
    fontName=heading_font, fontSize=36, leading=44, textColor=ACCENT, alignment=TA_CENTER)))
story.append(Spacer(1, 12))
story.append(Paragraph('GitHub + Vercel', ParagraphStyle('CoverSub',
    fontName=heading_font, fontSize=24, leading=30, textColor=HEADER_FILL, alignment=TA_CENTER)))
story.append(Spacer(1, 30))
story.append(HRFlowable(width="40%", thickness=2, color=ACCENT, spaceAfter=30, spaceBefore=0))
story.append(Paragraph('AI Peak Hours Monitor', ParagraphStyle('CoverProj',
    fontName=body_font, fontSize=16, leading=22, textColor=TEXT_MUTED, alignment=TA_CENTER)))
story.append(Spacer(1, 8))
story.append(Paragraph('Do codigo local ao site publico em minutos', ParagraphStyle('CoverDesc',
    fontName=body_font, fontSize=12, leading=18, textColor=TEXT_MUTED, alignment=TA_CENTER)))
story.append(Spacer(1, 60))
story.append(Paragraph('Abril 2026', ParagraphStyle('CoverDate',
    fontName=body_font, fontSize=11, leading=14, textColor=TEXT_MUTED, alignment=TA_CENTER)))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════
# SUMARIO
# ═══════════════════════════════════════════════════════════════
story.append(Paragraph('<b>Sumario</b>', sH1))
story.append(Spacer(1, 12))

toc_items = [
    '1. Visao Geral do Fluxo de Deploy',
    '2. Pre-requisitos',
    '3. Preparando o Projeto para Producao',
    '4. Criando uma Conta no GitHub',
    '5. Instalando e Configurando o Git',
    '6. Criando o Repositorio no GitHub',
    '7. Enviando o Codigo para o GitHub',
    '8. Criando uma Conta na Vercel',
    '9. Conectando GitHub com a Vercel',
    '10. Configurando o Projeto na Vercel',
    '11. Fazendo o Deploy',
    '12. Apos o Deploy: Proximos Passos',
    '13. Atualizando o Projeto (Workflow Diario)',
    '14. Dominio Personalizado',
    '15. Variaveis de Ambiente',
    '16. Solucionando Problemas Comuns',
    '17. Consideracoes sobre o Banco de Dados SQLite',
    '18. Compartilhando a Ferramenta',
]
for item in toc_items:
    story.append(Paragraph(item, ParagraphStyle('TOCItem', fontName=body_font,
        fontSize=11, leading=20, textColor=TEXT_PRIMARY, leftIndent=12)))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════
# 1. VISAO GERAL
# ═══════════════════════════════════════════════════════════════
story.append(Paragraph('<b>1. Visao Geral do Fluxo de Deploy</b>', sH1))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'O processo de publicacao do AI Peak Hours Monitor segue um fluxo direto e bem estabelecido na industria de desenvolvimento web moderno. '
    'A ideia central e simples: voce envia seu codigo para o GitHub (a maior plataforma de hospedagem de codigo do mundo) e a Vercel '
    '(a empresa criadora do Next.js) automaticamente detecta as mudancas e publica seu site na internet em segundos. '
    'Todo o processo, desde o primeiro comando ate ter um site publico acessivel, leva menos de 30 minutos.', sBodyJust))
story.append(Spacer(1, 8))
story.append(Paragraph(
    'Este guia foi elaborado para quem esta comecando agora e precisa de instrucoes passo a passo, sem pressupor conhecimento '
    'previo em Git, GitHub ou deploy. Cada etapa inclui os comandos exatos, explicacoes do que cada comando faz e dicas para '
    'evitar problemas comuns. O fluxo completo pode ser visualizado no diagrama abaixo:', sBodyJust))
story.append(Spacer(1, 10))

# Flow diagram as a table
flow_data = [
    [Paragraph('<b>Codigo Local</b>', sTCCenter)],
    [Paragraph('v', ParagraphStyle('Arrow', fontName=body_font, fontSize=14, alignment=TA_CENTER, textColor=ACCENT))],
    [Paragraph('<b>Git Init + Commit</b>', sTCCenter)],
    [Paragraph('v', ParagraphStyle('Arrow2', fontName=body_font, fontSize=14, alignment=TA_CENTER, textColor=ACCENT))],
    [Paragraph('<b>GitHub (Repositorio)</b>', sTCCenter)],
    [Paragraph('v', ParagraphStyle('Arrow3', fontName=body_font, fontSize=14, alignment=TA_CENTER, textColor=ACCENT))],
    [Paragraph('<b>Vercel (Auto-Deploy)</b>', sTCCenter)],
    [Paragraph('v', ParagraphStyle('Arrow4', fontName=body_font, fontSize=14, alignment=TA_CENTER, textColor=ACCENT))],
    [Paragraph('<b>Site Publico (.vercel.app)</b>', sTCCenter)],
]
flow_table = Table(flow_data, colWidths=[200])
flow_table.setStyle(TableStyle([
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('BOX', (0, 0), (0, 0), 1, ACCENT),
    ('BOX', (0, 2), (0, 2), 1, ACCENT),
    ('BOX', (0, 4), (0, 4), 1, ACCENT),
    ('BOX', (0, 6), (0, 6), 1, ACCENT),
    ('BOX', (0, 8), (0, 8), 2, SEM_SUCCESS),
    ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#e3f2fd')),
    ('BACKGROUND', (0, 2), (0, 2), colors.HexColor('#e3f2fd')),
    ('BACKGROUND', (0, 4), (0, 4), colors.HexColor('#e3f2fd')),
    ('BACKGROUND', (0, 6), (0, 6), colors.HexColor('#e3f2fd')),
    ('BACKGROUND', (0, 8), (0, 8), colors.HexColor('#e8f5e9')),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(flow_table)

# ═══════════════════════════════════════════════════════════════
# 2. PRE-REQUISITOS
# ═══════════════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(Paragraph('<b>2. Pre-requisitos</b>', sH1))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Antes de comecar o processo de deploy, certifique-se de que voce tem os seguintes itens configurados no seu computador. '
    'Cada um deles desempenha um papel essencial no fluxo de publicacao, e a falta de qualquer um deles interrompera o processo.', sBodyJust))
story.append(Spacer(1, 8))

story.append(make_table(
    ['Requisito', 'Versao Minima', 'Como Verificar', 'Onde Baixar'],
    [
        ['Node.js', 'v18+', 'node --version', 'nodejs.org'],
        ['npm ou bun', 'npm v9+', 'npm --version', 'Vem com Node.js'],
        ['Git', 'v2.40+', 'git --version', 'git-scm.com'],
        ['Conta GitHub', 'Gratuita', 'github.com', 'github.com/signup'],
        ['Conta Vercel', 'Gratuita', 'vercel.com', 'vercel.com/signup'],
        ['Navegador moderno', 'Qualquer', 'Chrome/Firefox/Edge', 'N/A'],
    ],
    [100, 65, 120, 120]
))

story.append(Spacer(1, 8))
story.append(tip_box(
    'Voce pode criar a conta da Vercel diretamente usando sua conta do GitHub, o que facilita a integracao posterior. '
    'Basta clicar em "Continue with GitHub" na pagina de cadastro da Vercel.'
))

# ═══════════════════════════════════════════════════════════════
# 3. PREPARANDO O PROJETO
# ═══════════════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(Paragraph('<b>3. Preparando o Projeto para Producao</b>', sH1))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Antes de enviar o codigo para o GitHub, e importante garantir que o projeto esta pronto para rodar em um ambiente de producao. '
    'Isso significa verificar se o build funciona corretamente, se os arquivos desnecessarios estao excluidos e se as configuracoes '
    'estao adequadas para um servidor publico. Essa etapa evita surpresas desagradaveis durante o deploy.', sBodyJust))

story.append(Spacer(1, 10))
story.append(Paragraph('<b>3.1 Verificar o Build</b>', sH3))
story.append(Paragraph('Execute o comando de build para confirmar que o projeto compila sem erros:', sBody))
story.append(code_block('cd /home/z/my-project\nnpm run build'))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Se o build completar com sucesso (mostrando "Compiled successfully" e a lista de rotas), seu projeto esta pronto para deploy. '
    'Se houver erros, corrija-os antes de prosseguir. Erros de TypeScript ou imports quebrados causarao falha no deploy na Vercel.', sBodyJust))

story.append(Spacer(1, 10))
story.append(Paragraph('<b>3.2 Verificar o .gitignore</b>', sH3))
story.append(Paragraph(
    'O arquivo .gitignore diz ao Git quais arquivos NAO devem ser enviados ao GitHub. Isso e crucial para nao enviar '
    'dependencias locais, banco de dados, ou arquivos de build que serao recriados pela Vercel. Verifique se o .gitignore inclui:', sBodyJust))
story.append(code_block(
    'node_modules/\n.next/\ndb/*.db\n*.db-journal\n.env.local\n.env\n.DS_Store'
))
story.append(Spacer(1, 6))
story.append(warn_box(
    'O arquivo do banco de dados SQLite (db/custom.db) esta no .gitignore porque sera recriado automaticamente pela API de seed '
    'quando o deploy for feito. Nao envie bancos de dados locais para o GitHub.'
))

story.append(Spacer(1, 10))
story.append(Paragraph('<b>3.3 Arquivos Essenciais do Projeto</b>', sH3))
story.append(Paragraph(
    'Certifique-se de que o repositorio contem os seguintes arquivos fundamentais para que a Vercel saiba como construir e executar '
    'o projeto corretamente. A Vercel detecta automaticamente projetos Next.js quando encontra o package.json e next.config.ts.', sBodyJust))
story.append(Spacer(1, 6))

story.append(make_table(
    ['Arquivo', 'Funcao', 'Obrigatorio?'],
    [
        ['package.json', 'Lista dependencias e scripts (build, start, dev)', 'Sim'],
        ['next.config.ts', 'Configuracoes do Next.js', 'Sim'],
        ['tsconfig.json', 'Configuracoes do TypeScript', 'Sim'],
        ['tailwind.config.ts', 'Configuracoes do Tailwind CSS', 'Sim'],
        ['.gitignore', 'Arquivos a ignorar no Git', 'Recomendado'],
        ['README.md', 'Documentacao do projeto', 'Recomendado'],
    ],
    [110, 220, 80]
))

# ═══════════════════════════════════════════════════════════════
# 4. CRIANDO CONTA NO GITHUB
# ═══════════════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(Paragraph('<b>4. Criando uma Conta no GitHub</b>', sH1))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'O GitHub e a plataforma onde seu codigo ficara armazenado na nuvem. Ele funciona como um "Google Drive para codigo", '
    'permitindo que voce gerencie versoes, colabore com outros desenvolvedores e conecte ferramentas como a Vercel. '
    'A conta gratuita e mais do que suficiente para projetos pessoais e inclui repositorios ilimitados.', sBodyJust))
story.append(Spacer(1, 8))

story.append(step_header(1, 'Acesse github.com/signup'))
story.append(Paragraph('Abra seu navegador e va para github.com/signup. Preencha seu email, crie uma senha e escolha um nome de usuario. '
    'O nome de usuario fara parte da URL dos seus repositorios (ex: github.com/seu-usuario/ai-peak-monitor).', sBody))

story.append(step_header(2, 'Verifique seu email'))
story.append(Paragraph('O GitHub enviara um codigo de verificacao. Confirme-o para ativar sua conta. Sem essa verificacao, '
    'voce nao conseguira criar repositorios.', sBody))

story.append(step_header(3, 'Escolha o plano gratuito'))
story.append(Paragraph('Na pagina de planos, selecione "Free". O plano pago (Pro) nao e necessario para este projeto. '
    'A versao gratuita permite repositorios privados e publicos ilimitados, integracao com a Vercel e todas as funcionalidades '
    'que voce precisa.', sBody))

story.append(Spacer(1, 6))
story.append(tip_box(
    'Escolha um nome de usuario profissional e facil de lembrar. Ele aparecera nas URLs dos seus projetos. '
    'Ex: se seu usuario for "joaosilva", seus repos serao github.com/joaosilva/nome-do-projeto.'
))

# ═══════════════════════════════════════════════════════════════
# 5. INSTALANDO E CONFIGURANDO O GIT
# ═══════════════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(Paragraph('<b>5. Instalando e Configurando o Git</b>', sH1))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'O Git e o sistema de controle de versao que rastreia todas as mudancas no seu codigo. Pense nele como um "salvar jogo" '
    'sofisticado: cada commit e um ponto de salvamento que voce pode restaurar a qualquer momento. A Vercel usa o Git para '
    'saber quando voce fez mudancas e precisa de um novo deploy.', sBodyJust))
story.append(Spacer(1, 8))

story.append(Paragraph('<b>5.1 Instalacao</b>', sH3))
story.append(Paragraph(
    'No Linux (Ubuntu/Debian), instale o Git com:', sBody))
story.append(code_block('sudo apt update\nsudo apt install git -y'))
story.append(Paragraph('No macOS, o Git ja vem instalado com as ferramentas de linha de comando do Xcode. '
    'No Windows, baixe o instalador em git-scm.com/download/win.', sBody))

story.append(Spacer(1, 8))
story.append(Paragraph('<b>5.2 Configuracao Inicial</b>', sH3))
story.append(Paragraph(
    'Apos instalar, configure sua identidade. O Git usa essas informacoes para registrar quem fez cada mudanca no codigo. '
    'Use o mesmo email que cadastrou no GitHub para que os commits sejam associados automaticamente a sua conta:', sBodyJust))
story.append(code_block(
    'git config --global user.name "Seu Nome"\ngit config --global user.email "seu-email@exemplo.com"'
))
story.append(Spacer(1, 6))
story.append(Paragraph('Verifique se a configuracao esta correta:', sBody))
story.append(code_block('git config --list'))
story.append(Spacer(1, 6))
story.append(tip_box(
    'Use o mesmo email do GitHub! Se os emails forem diferentes, o GitHub nao conseguira associar seus commits a sua conta, '
    'e seu perfil nao mostrara as contribuicoes.'
))

story.append(Spacer(1, 8))
story.append(Paragraph('<b>5.3 Autenticacao com GitHub (Token Pessoal)</b>', sH3))
story.append(Paragraph(
    'O GitHub nao aceita mais senhas diretamente no terminal. Em vez disso, voce precisa criar um Personal Access Token (PAT) '
    'que funciona como uma "senha tecnica" para o Git se comunicar com o GitHub. Veja como criar:', sBodyJust))
story.append(Spacer(1, 4))
story.append(numbered(1, 'Acesse github.com/settings/tokens'))
story.append(numbered(2, 'Clique em "Generate new token" e selecione "Generate new token (classic)"'))
story.append(numbered(3, 'De um nome ao token (ex: "vercel-deploy")'))
story.append(numbered(4, 'Selecione a data de expiracao (90 dias e um bom comeco)'))
story.append(numbered(5, 'Marque a opcao "repo" (controle completo de repositorios)'))
story.append(numbered(6, 'Clique em "Generate token"'))
story.append(numbered(7, 'COPIE O TOKEN IMEDIATAMENTE! Ele nao sera mostrado novamente'))
story.append(Spacer(1, 6))
story.append(warn_box(
    'Guarde seu token em um local seguro (gerenciador de senhas). Nunca compartilhe publicamente ou envie ao GitHub. '
    'Se alguem obtiver seu token, tera acesso total aos seus repositorios.'
))

# ═══════════════════════════════════════════════════════════════
# 6. CRIANDO O REPOSITORIO
# ═══════════════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(Paragraph('<b>6. Criando o Repositorio no GitHub</b>', sH1))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Um repositorio (ou "repo") e a pasta do seu projeto no GitHub. E la que o codigo ficara armazenado, versionado e '
    'acessivel para a Vercel. A criacao do repositorio e feita pela interface web do GitHub e leva menos de 1 minuto.', sBodyJust))
story.append(Spacer(1, 8))

story.append(step_header(1, 'No GitHub, clique no botao "+" no canto superior direito'))
story.append(Paragraph('Selecione "New repository". Voce sera levado a pagina de criacao.', sBody))

story.append(step_header(2, 'Preencha as informacoes'))
story.append(bullet('<b>Repository name</b>: ai-peak-hours-monitor (use letras minusculas e hifens)'))
story.append(bullet('<b>Description</b>: Monitor de horarios de pico de servicos de IA globais'))
story.append(bullet('<b>Visibility</b>: Public (necessario para o plano gratuito da Vercel) ou Private'))
story.append(Spacer(1, 4))
story.append(Paragraph(
    'Se voce escolher "Private", o repositorio sera visivel apenas para voce. O plano gratuito da Vercel permite '
    'deploy de repositorios privados, mas ha limites de uso. Para comecar, Public e a opcao mais simples.', sBodyJust))

story.append(step_header(3, 'NAO inicialize com README, .gitignore ou license'))
story.append(Paragraph(
    'Como ja temos esses arquivos no projeto local, nao marque nenhuma das opcoes de inicializacao. '
    'Marcar essas opcoes criaria conflitos ao enviar o codigo existente.', sBodyJust))

story.append(step_header(4, 'Clique em "Create repository"'))

# ═══════════════════════════════════════════════════════════════
# 7. ENVIANDO O CODIGO
# ═══════════════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(Paragraph('<b>7. Enviando o Codigo para o GitHub</b>', sH1))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Agora vamos conectar sua pasta local ao repositorio no GitHub e enviar todo o codigo. Essa e a etapa onde o Git entra '
    'em acao. Cada comando tem uma funcao especifica e devem ser executados na ordem correta. Apos essa configuracao inicial, '
    'enviar mudancas futuras sera muito mais simples.', sBodyJust))
story.append(Spacer(1, 8))

story.append(Paragraph('<b>7.1 Inicializar o Git no Projeto</b>', sH3))
story.append(Paragraph('Esse comando cria uma pasta oculta .git que comeca a rastrear todas as mudancas:', sBody))
story.append(code_block('cd /home/z/my-project\ngit init'))

story.append(Spacer(1, 8))
story.append(Paragraph('<b>7.2 Adicionar Todos os Arquivos</b>', sH3))
story.append(Paragraph(
    'O comando "git add" prepara os arquivos para serem salvos (commitados). O ponto (.) significa "todos os arquivos", '
    'mas o .gitignore garantira que arquivos indesejados sejam excluidos automaticamente:', sBodyJust))
story.append(code_block('git add .'))

story.append(Spacer(1, 8))
story.append(Paragraph('<b>7.3 Criar o Primeiro Commit</b>', sH3))
story.append(Paragraph(
    'Um commit e um "ponto de salvamento" do projeto. A mensagem (-m) descreve o que foi feito. '
    'Escreva mensagens claras e descritivas; isso ajuda enormemente quando voce precisa entender o historico de mudancas:', sBodyJust))
story.append(code_block('git commit -m "Versao inicial: AI Peak Hours Monitor com 50 servicos"'))

story.append(Spacer(1, 8))
story.append(Paragraph('<b>7.4 Conectar ao Repositorio Remoto</b>', sH3))
story.append(Paragraph(
    'Esse comando diz ao Git onde esta o repositorio no GitHub. Substitua "seu-usuario" pelo seu nome de usuario real:', sBodyJust))
story.append(code_block('git remote add origin https://github.com/seu-usuario/ai-peak-hours-monitor.git'))

story.append(Spacer(1, 8))
story.append(Paragraph('<b>7.5 Enviar o Codigo (Push)</b>', sH3))
story.append(Paragraph(
    'O comando push envia seus commits locais para o GitHub. O parametro "-u" configura o rastreamento para que '
    'futuros pushes sejam mais simples. Quando solicitado, use seu nome de usuario do GitHub como login e o '
    'Personal Access Token (PAT) como senha:', sBodyJust))
story.append(code_block('git branch -M main\ngit push -u origin main'))
story.append(Spacer(1, 6))
story.append(tip_box(
    'Na primeira vez que voce fizer push, o terminal pedira suas credenciais. Use seu username do GitHub e o PAT '
    '(nao sua senha). Depois disso, as credenciais serao salvas e nao sera necessario digitar novamente.'
))

# ═══════════════════════════════════════════════════════════════
# 8. CONTA NA VERCEL
# ═══════════════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(Paragraph('<b>8. Criando uma Conta na Vercel</b>', sH1))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'A Vercel e a plataforma de hospedagem criada pela mesma empresa que desenvolve o Next.js. Ela oferece deploy automatico, '
    'SSL gratuito, CDN global e uma interface extremamente amigavel. O plano gratuito (Hobby) e generoso e perfeito para '
    'projetos pessoais, permitindo dominios personalizados, certificados HTTPS automaticos e ate 100GB de banda mensal.', sBodyJust))
story.append(Spacer(1, 8))

story.append(step_header(1, 'Acesse vercel.com/signup'))
story.append(step_header(2, 'Clique em "Continue with GitHub" (recomendado)'))
story.append(Paragraph(
    'Usar o login do GitHub e a forma mais rapida e ja prepara a integracao automatica. A Vercel pedira permissao para '
    'acessar seus repositorios; voce pode conceder acesso a todos ou selecionar apenas o repositorio especifico do projeto.', sBodyJust))
story.append(step_header(3, 'Autorize a Vercel a acessar seus repositorios GitHub'))
story.append(step_header(4, 'Complete o cadastro escolhendo o plano Hobby (gratuito)'))

# ═══════════════════════════════════════════════════════════════
# 9. CONECTANDO GITHUB + VERCEL
# ═══════════════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(Paragraph('<b>9. Conectando GitHub com a Vercel</b>', sH1))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'A conexao entre GitHub e Vercel e o que torna o deploy automatico possivel. Quando voce envia mudancas ao GitHub, '
    'a Vercel detecta automaticamente e inicia um novo deploy. Isso significa que basta fazer "git push" para que seu site '
    'seja atualizado em segundos, sem nenhum passo manual adicional. Essa integracao e o coracao do fluxo de deploy moderno.', sBodyJust))
story.append(Spacer(1, 8))

story.append(step_header(1, 'No painel da Vercel, clique em "Add New..." e depois "Project"'))
story.append(step_header(2, 'Na secao "Import Git Repository", voce vera seus repositorios do GitHub'))
story.append(Paragraph(
    'Se o repositorio nao aparecer, clique em "Adjust GitHub App Permissions" para conceder acesso. '
    'Voce sera redirecionado ao GitHub para autorizar o acesso ao repositorio especifico.', sBodyJust))
story.append(step_header(3, 'Encontre "ai-peak-hours-monitor" e clique em "Import"'))

# ═══════════════════════════════════════════════════════════════
# 10. CONFIGURANDO O PROJETO
# ═══════════════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(Paragraph('<b>10. Configurando o Projeto na Vercel</b>', sH1))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Antes de clicar em Deploy, voce precisa configurar como a Vercel vai construir e executar o projeto. '
    'Na maioria dos casos, a Vercel detecta automaticamente que e um projeto Next.js e preenche as configuracoes corretas, '
    'mas e importante verificar cada campo para evitar surpresas.', sBodyJust))
story.append(Spacer(1, 8))

story.append(make_table(
    ['Configuracao', 'Valor Esperado', 'Observacao'],
    [
        ['Framework Preset', 'Next.js', 'Vercel detecta automaticamente'],
        ['Root Directory', './', 'Deixe padrao se o projeto esta na raiz'],
        ['Build Command', 'npm run build', 'Pode ser "next build" tambem'],
        ['Output Directory', '.next', 'Padrao do Next.js, nao altere'],
        ['Install Command', 'npm install', 'Padrao, nao altere'],
        ['Node.js Version', '18.x ou 20.x', 'Selecione nas configuracoes'],
    ],
    [100, 130, 180]
))

story.append(Spacer(1, 8))
story.append(warn_box(
    'Se a Vercel nao detectar automaticamente o Framework Preset como Next.js, selecione-o manualmente no dropdown. '
    'Isso garante que as configuracoes de build e output sejam preenchidas corretamente.'
))

# ═══════════════════════════════════════════════════════════════
# 11. FAZENDO O DEPLOY
# ═══════════════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(Paragraph('<b>11. Fazendo o Deploy</b>', sH1))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Agora vem a parte mais emocionante: ver seu projeto na internet! Clique no botao "Deploy" na parte inferior da pagina '
    'de configuracao. A Vercel iniciara o processo de build, que leva entre 1 e 3 minutos na primeira vez. '
    'Voce vera um log em tempo real mostrando cada etapa: instalacao de dependencias, compilacao TypeScript, '
    'geracao de paginas estaticas e otimizacao de assets.', sBodyJust))
story.append(Spacer(1, 8))

story.append(Paragraph('<b>O que acontece durante o deploy:</b>', sH3))
story.append(numbered(1, '<b>Install</b>: npm install baixa todas as dependencias do package.json'))
story.append(numbered(2, '<b>Build</b>: next build compila TypeScript, gera paginas e otimiza o codigo'))
story.append(numbered(3, '<b>Deploy</b>: Os arquivos compilados sao distribuidos para a CDN global da Vercel'))
story.append(numbered(4, '<b>Ready</b>: O site fica acessivel em seu-dominio.vercel.app'))

story.append(Spacer(1, 8))
story.append(Paragraph(
    'Quando o deploy terminar com sucesso, voce vera um aviso verde com confetes e uma URL como: '
    'ai-peak-hours-monitor-seu-usuario.vercel.app. Essa e a URL publica do seu site!', sBodyJust))
story.append(Spacer(1, 6))
story.append(tip_box(
    'Se o deploy falhar, nao entre em panico! Clique no log de erro para ver exatamente o que deu errado. '
    'Os erros mais comuns sao: dependencias faltando, erros de TypeScript, ou build command incorreto.'
))

# ═══════════════════════════════════════════════════════════════
# 12. APOS O DEPLOY
# ═══════════════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(Paragraph('<b>12. Apos o Deploy: Proximos Passos</b>', sH1))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Parabens! Seu site esta no ar. Agora existem varias acoes importantes para garantir que tudo funcione corretamente '
    'e que voce tenha controle total sobre o projeto em producao.', sBodyJust))
story.append(Spacer(1, 8))

story.append(Paragraph('<b>12.1 Verificar o Site</b>', sH3))
story.append(Paragraph(
    'Acesse a URL gerada pela Vercel no navegador. Verifique se a pagina carrega, se os dados dos servicos de IA aparecem, '
    'se o heatmap funciona e se o seletor de idiomas responde. O primeiro acesso pode ser um pouco mais lento '
    'porque as funcoes serverless precisam ser "aquecidas" (cold start), mas os acessos subsequentes serao rapidos.', sBodyJust))

story.append(Spacer(1, 8))
story.append(Paragraph('<b>12.2 Verificar o Painel da Vercel</b>', sH3))
story.append(Paragraph(
    'No painel da Vercel (vercel.com/dashboard), voce tera acesso a metricas importantes como numero de visitantes, '
    'tempo de resposta das funcoes serverless, logs de erros e historico de deploys. Essas informacoes sao essenciais '
    'para monitorar a saude do seu site e identificar problemas rapidamente.', sBodyJust))

story.append(Spacer(1, 8))
story.append(Paragraph('<b>12.3 Configurar Notificacoes</b>', sH3))
story.append(Paragraph(
    'Na Vercel, voce pode configurar notificacoes por email para ser avisado quando um deploy for concluido (com sucesso ou falha). '
    'Vá em Settings > Notifications e ative as opcoes desejadas. Tambem e possivel integrar com Slack, Discord ou GitHub Actions '
    'para automacoes mais avancadas.', sBodyJust))

# ═══════════════════════════════════════════════════════════════
# 13. WORKFLOW DIARIO
# ═══════════════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(Paragraph('<b>13. Atualizando o Projeto (Workflow Diario)</b>', sH1))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Apos a configuracao inicial, o fluxo de trabalho diario para atualizar o projeto e simples e rapido. '
    'Toda vez que voce fizer mudancas no codigo e quiser que elas aparecam no site, siga estes tres comandos. '
    'A Vercel detecta automaticamente o push e faz o redeploy em segundos, sem nenhuma acao manual necessaria.', sBodyJust))
story.append(Spacer(1, 8))

story.append(code_block(
    '# 1. Adicionar mudancas\n git add .\n\n# 2. Salvar com mensagem descritiva\n git commit -m "Adicionado novo servico de IA"\n\n# 3. Enviar para GitHub (Vercel detecta e faz deploy automatico)\n git push'
))

story.append(Spacer(1, 10))
story.append(Paragraph('<b>Workflow Visual Completo:</b>', sH3))

story.append(make_table(
    ['Comando', 'O que Faz', 'Quando Usar'],
    [
        ['git add .', 'Prepara todos os arquivos modificados', 'Apos editar codigo'],
        ['git commit -m "..."', 'Cria ponto de salvamento', 'Apos terminar uma funcionalidade'],
        ['git push', 'Envia para GitHub (aciona deploy)', 'Quando quiser publicar'],
        ['git pull', 'Baixa mudancas do GitHub', 'Antes de comecar a trabalhar'],
        ['git status', 'Mostra arquivos modificados', 'Para verificar o que mudou'],
        ['git log --oneline', 'Mostra historico de commits', 'Para revisar mudancas'],
    ],
    [110, 170, 130]
))

# ═══════════════════════════════════════════════════════════════
# 14. DOMINIO PERSONALIZADO
# ═══════════════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(Paragraph('<b>14. Dominio Personalizado</b>', sH1))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Por padrao, seu site sera acessivel em um subdominio da Vercel como ai-peak-hours-monitor.vercel.app. '
    'Se voce quiser um dominio mais profissional como aipeakmonitor.com, pode configurar um dominio personalizado. '
    'A Vercel suporta dominios comprados em qualquer registrador (Registro.br, GoDaddy, Namecheap, etc.) e configura '
    'automaticamente o certificado SSL/HTTPS para que seu site seja seguro.', sBodyJust))
story.append(Spacer(1, 8))

story.append(step_header(1, 'Compre um dominio'))
story.append(Paragraph('Registre um dominio em um servico como Registro.br (para .com.br), Namecheap ou Cloudflare Registrar. '
    'Dominios .com custam tipicamente entre R$ 30-50/ano, e .com.br a partir de R$ 40/ano.', sBody))

story.append(step_header(2, 'Na Vercel, va em Settings > Domains'))
story.append(Paragraph('Adicione seu dominio (ex: aipeakmonitor.com). A Vercel mostrara os registros DNS que voce precisa configurar.', sBody))

story.append(step_header(3, 'Configure os registros DNS no seu registrador'))
story.append(Paragraph(
    'Adicione um registro CNAME apontando "www" para "cname.vercel-dns.com" e um registro A apontando "@" para '
    '76.76.21.21 (IP da Vercel). As instrucoes exatas aparecem no painel da Vercel quando voce adiciona o dominio. '
    'A propagacao DNS pode levar ate 48 horas, mas geralmente funciona em minutos.', sBodyJust))

story.append(step_header(4, 'Aguarde a verificacao automatica'))
story.append(Paragraph('A Vercel detecta quando o DNS esta configurado e emite automaticamente um certificado SSL gratuito. '
    'Seu site estara acessivel via HTTPS no dominio personalizado.', sBody))

# ═══════════════════════════════════════════════════════════════
# 15. VARIAVEIS DE AMBIENTE
# ═══════════════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(Paragraph('<b>15. Variaveis de Ambiente</b>', sH1))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Variaveis de ambiente sao configuracoes sensiveis (como chaves de API) que nao devem ser incluidas diretamente no codigo. '
    'O projeto AI Peak Hours Monitor usa o pacote z-ai-web-dev-sdk para verificacao de status, e as credenciais desse SDK '
    'devem ser configuradas como variaveis de ambiente na Vercel para funcionar em producao.', sBodyJust))
story.append(Spacer(1, 8))

story.append(Paragraph('<b>Como configurar na Vercel:</b>', sH3))
story.append(numbered(1, 'No painel do projeto, va em Settings > Environment Variables'))
story.append(numbered(2, 'Adicione cada variavel necessaria com nome e valor'))
story.append(numbered(3, 'Selecione os ambientes: Production, Preview e Development'))
story.append(numbered(4, 'Clique em Save e faca um redeploy para aplicar'))

story.append(Spacer(1, 8))
story.append(make_table(
    ['Variavel', 'Exemplo', 'Obrigatorio?'],
    [
        ['ZAI_API_KEY', 'sk-xxx...', 'Se usar verificacao de status'],
        ['NEXT_PUBLIC_SITE_URL', 'https://ai-peak.vercel.app', 'Opcional'],
    ],
    [140, 160, 110]
))

story.append(Spacer(1, 6))
story.append(warn_box(
    'Nunca coloque chaves de API ou senhas diretamente no codigo! Use sempre variaveis de ambiente. '
    'Arquivos .env estao no .gitignore e nao serao enviados ao GitHub.'
))

# ═══════════════════════════════════════════════════════════════
# 16. SOLUCAO DE PROBLEMAS
# ═══════════════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(Paragraph('<b>16. Solucionando Problemas Comuns</b>', sH1))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Problemas durante o deploy sao normais e acontecem com todos os desenvolvedores. A chave e saber identificar '
    'o erro pela mensagem e aplicar a correcao adequada. Abaixo estao os problemas mais frequentes e suas solucoes.', sBodyJust))
story.append(Spacer(1, 8))

story.append(make_table(
    ['Problema', 'Causa Provavel', 'Solucao'],
    [
        ['Build Failed: Module not found', 'Dependencia faltando no package.json', 'Adicione com npm install pacote && git add . && git commit && git push'],
        ['Build Failed: Type error', 'Erro de TypeScript no codigo', 'Corrija o tipo e faca push novamente'],
        ['500 Internal Server Error', 'Erro na API route ou banco de dados', 'Verifique os logs na Vercel (Deployments > Function Logs)'],
        ['Pagina em branco', 'Erro de hidratacao ou import quebrado', 'Verifique o console do navegador para erros'],
        ['Banco de dados vazio', 'SQLite nao persiste em serverless', 'A API de seed recria o banco; verifique se a rota /api/seed funciona'],
        ['Deploy demora muito', 'Dependencias pesadas ou build lento', 'Verifique se nao esta instalando pacotes desnecessarios'],
        ['git push rejeitado', 'Mudancas no repositorio remoto', 'Facaga git pull --rebase origin main antes do push'],
        ['Token expirado', 'PAT do GitHub venceu', 'Gere um novo token em github.com/settings/tokens'],
    ],
    [110, 120, 180]
))

# ═══════════════════════════════════════════════════════════════
# 17. CONSIDERACOES SQLITE
# ═══════════════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(Paragraph('<b>17. Consideracoes sobre o Banco de Dados SQLite</b>', sH1))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'O AI Peak Hours Monitor usa SQLite como banco de dados, o que funciona perfeitamente em desenvolvimento local. '
    'No entanto, em ambientes serverless como a Vercel, cada funcao de API roda em um container efemero que e criado e '
    'destruido a cada request. Isso significa que o arquivo SQLite e recriado a cada chamada, o que funciona para dados '
    'de seed (como a lista de servicos), mas nao seria adequado para dados de usuarios.', sBodyJust))
story.append(Spacer(1, 8))

story.append(Paragraph('<b>Por que funciona neste projeto:</b>', sH3))
story.append(bullet('Os dados dos servicos de IA sao estaticos (seed data), nao precisam persistir entre requests'))
story.append(bullet('A rota /api/seed recria o banco automaticamente quando necessario'))
story.append(bullet('A rota /api/peak-hours recalcula os horarios de pico a partir dos dados de seed'))

story.append(Spacer(1, 8))
story.append(Paragraph('<b>Se voce precisar de persistencia real no futuro, considere migrar para:</b>', sH3))
story.append(make_table(
    ['Opcao', 'Tipo', 'Custo', 'Dificuldade'],
    [
        ['Turso', 'SQLite distribuido', 'Gratuito (ate 9GB)', 'Baixa - compativel com better-sqlite3'],
        ['PlanetScale', 'MySQL serverless', 'Gratuito (1 branch)', 'Media - requer ajuste no schema'],
        ['Supabase', 'PostgreSQL + Auth', 'Gratuito (500MB)', 'Media - requer migracao Prisma'],
        ['Neon', 'PostgreSQL serverless', 'Gratuito (3GB)', 'Media - boa integracao com Vercel'],
        ['Vercel Postgres', 'PostgreSQL gerenciado', 'Gratuito (256MB)', 'Baixa - integracao nativa'],
    ],
    [95, 115, 110, 100]
))

# ═══════════════════════════════════════════════════════════════
# 18. COMPARTILHANDO
# ═══════════════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(Paragraph('<b>18. Compartilhando a Ferramenta</b>', sH1))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Agora que seu site esta publicado e acessivel, e hora de compartilha-lo com o mundo. Existem diversas estrategias '
    'para divulgar o AI Peak Hours Monitor, desde o simples compartilhamento do link ate a criacao de uma comunidade em '
    'torno da ferramenta. Quanto mais pessoas usarem, mais feedback voce recebera para melhorar o produto.', sBodyJust))
story.append(Spacer(1, 8))

story.append(Paragraph('<b>18.1 Compartilhamento Direto</b>', sH3))
story.append(bullet('Envie a URL do site para colegas e amigos que trabalham com IA'))
story.append(bullet('Compartilhe em grupos de WhatsApp e Telegram sobre tecnologia e IA'))
story.append(bullet('Poste no LinkedIn com um breve texto sobre o que a ferramenta faz e como ajuda'))

story.append(Spacer(1, 8))
story.append(Paragraph('<b>18.2 Redes Sociais e Comunidades</b>', sH3))
story.append(bullet('Reddit: Compartilhe em r/artificial, r/MachineLearning, r/ChatGPT, r/LocalLLaMA'))
story.append(bullet('Twitter/X: Poste com hashtags como #AI #PeakHours #Productivity'))
story.append(bullet('Hacker News: Submeta em "Show HN" se o projeto for open source'))
story.append(bullet('Product Hunt: Lance como produto para alcancar early adopters'))
story.append(bullet('Discord: Servidores de IA como Midjourney, OpenAI, LocalLLaMA'))

story.append(Spacer(1, 8))
story.append(Paragraph('<b>18.3 Melhore o README do GitHub</b>', sH3))
story.append(Paragraph(
    'Um bom README e essencial para que outras pessoas entendam e usem seu projeto. Inclua: descricao do projeto, '
    'screenshots, instrucoes de instalacao local, link do deploy ao vivo, tecnologias utilizadas e como contribuir. '
    'O README e a primeira coisa que as pessoas veem ao visitar seu repositorio, entao invista tempo nele.', sBodyJust))

story.append(Spacer(1, 8))
story.append(Paragraph('<b>18.4 Open Source e Contribuicoes</b>', sH3))
story.append(Paragraph(
    'Se quiser que outras pessoas contribuam com o projeto, adicione uma licenca (MIT e a mais comum e permissiva), '
    'crie um arquivo CONTRIBUTING.md com instrucoes de como contribuir e abra "Issues" no GitHub listando funcionalidades '
    'desejadas. Projetos open source atraem contribuidores quando tem documentacao clara e sao amigaveis para iniciantes.', sBodyJust))

story.append(Spacer(1, 20))
story.append(hr())
story.append(Paragraph(
    'Este guia cobre todo o processo necessario para publicar o AI Peak Hours Monitor na internet. '
    'Lembre-se: o deploy nao e um evento unico, e um processo continuo. Cada vez que voce fizer mudancas no codigo, '
    'basta git add, git commit e git push para que a Vercel atualize o site automaticamente.', sBodyJust))

# ━━ Build ━━
doc.build(story)
print(f'PDF gerado com sucesso: {output_path}')
