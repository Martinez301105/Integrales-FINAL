/* Calculadora web estática basada en los módulos Python del proyecto.
   Acepta enteros, decimales y fracciones como 3/4 o -2.5. */
(function(){
'use strict';

class Frac{
    constructor(n,d=1n){
        if(typeof n === 'number') n = BigInt(Math.trunc(n));
        if(typeof d === 'number') d = BigInt(Math.trunc(d));
        if(d === 0n) throw new Error('No se permite dividir entre cero.');
        if(d < 0n){ n = -n; d = -d; }
        const g = gcd(abs(n), abs(d));
        this.n = n / g;
        this.d = d / g;
    }
    static parse(texto,nombre='valor'){
        let s = String(texto ?? '').trim().replace(',', '.');
        if(!s) throw new Error(`${nombre} no puede estar vacío.`);
        if(/[πφϕ]|\b(pi|e|phi|fi)\b/i.test(s)) return RealVal.parse(s, nombre);
        if(s.includes('/')){
            const partes = s.split('/');
            if(partes.length !== 2) throw new Error(`${nombre} debe tener una sola diagonal, por ejemplo 3/4.`);
            const a = Frac.parseDecimal(partes[0].trim(), nombre);
            const b = Frac.parseDecimal(partes[1].trim(), nombre);
            if(b.n === 0n) throw new Error(`${nombre} no puede tener denominador cero.`);
            return a.div(b);
        }
        return Frac.parseDecimal(s, nombre);
    }
    static parseDecimal(s,nombre){
        if(!/^[-+]?\d+(\.\d+)?$/.test(s)) throw new Error(`${nombre} debe ser real: entero, decimal o fracción.`);
        let sign = 1n;
        if(s[0] === '-'){ sign = -1n; s = s.slice(1); }
        if(s[0] === '+'){ s = s.slice(1); }
        const partes = s.split('.');
        const entero = partes[0] || '0';
        const dec = partes[1] || '';
        const den = 10n ** BigInt(dec.length);
        const num = BigInt(entero + dec) * sign;
        return new Frac(num, den);
    }
    add(o){ o = toFrac(o); if(o instanceof RealVal) return new RealVal(this.toNumber()).add(o); return new Frac(this.n*o.d + o.n*this.d, this.d*o.d); }
    sub(o){ o = toFrac(o); if(o instanceof RealVal) return new RealVal(this.toNumber()).sub(o); return new Frac(this.n*o.d - o.n*this.d, this.d*o.d); }
    mul(o){ o = toFrac(o); if(o instanceof RealVal) return new RealVal(this.toNumber()).mul(o); return new Frac(this.n*o.n, this.d*o.d); }
    div(o){ o = toFrac(o); if(o instanceof RealVal) return new RealVal(this.toNumber()).div(o); if(o.n === 0n) throw new Error('No se permite dividir entre cero.'); return new Frac(this.n*o.d, this.d*o.n); }
    neg(){ return new Frac(-this.n, this.d); }
    eq(o){ o = toFrac(o); if(o instanceof RealVal) return Math.abs(this.toNumber()-o.toNumber()) < 1e-12; return this.n === o.n && this.d === o.d; }
    eqInt(v){ return this.d === 1n && this.n === BigInt(v); }
    isZero(){ return this.n === 0n; }
    isOne(){ return this.n === this.d; }
    isMinusOne(){ return this.n === -this.d; }
    abs(){ return new Frac(abs(this.n), this.d); }
    toNumber(){ return Number(this.n) / Number(this.d); }
    toPlain(){ return this.d === 1n ? this.n.toString() : `${this.n.toString()}/${this.d.toString()}`; }
    toLatex(){
        if(this.d === 1n) return this.n.toString();
        if(this.n < 0n) return `-\\frac{${(-this.n).toString()}}{${this.d.toString()}}`;
        return `\\frac{${this.n.toString()}}{${this.d.toString()}}`;
    }
    toSignedLatex(){ return this.toLatex(); }
}

class RealVal{
    constructor(valor, plain=null, latex=null){
        this.valor = Number(valor);
        if(!Number.isFinite(this.valor)) throw new Error('El valor numérico no es finito.');
        this.plain = plain || fmtRealPlain(this.valor);
        this.latex = latex || this.plain;
    }
    static parse(texto,nombre='valor'){
        let original = String(texto ?? '').trim();
        if(!original) throw new Error(`${nombre} no puede estar vacío.`);
        let normal = original
            .replace(/π/g,'pi')
            .replace(/[φϕ]/g,'phi')
            .replace(/,/g,'.')
            .replace(/\s+/g,'')
            .toLowerCase();
        // Permite productos implícitos: 2pi, 2e, 2phi, pi(2), etc.
        normal = normal.replace(/(\d|\)|pi|e|phi)(?=pi|e|phi|\()/g,'$1*');
        if(!/^[0-9piehf\.\+\-\*\/\(\)]+$/.test(normal) || /[^a-z]h|h[^i]|f[^i]|i[^\+\-\*\/\(\)0-9piehf]/.test(normal)){
            // Segunda validación más clara por tokens.
            if(!/^[0-9\.\+\-\*\/\(\)]*(pi|e|phi|[0-9\.\+\-\*\/\(\)]*)*$/.test(normal)){
                throw new Error(`${nombre} solo puede usar números, pi, e, phi, +, -, *, / y paréntesis.`);
            }
        }
        const jsExpr = normal
            .replace(/phi/g,'((1+Math.sqrt(5))/2)')
            .replace(/pi/g,'Math.PI')
            .replace(/\be\b/g,'Math.E');
        let valor;
        try{ valor = Function('return (' + jsExpr + ')')(); }
        catch(error){ throw new Error(`No pude leer ${nombre}. Ejemplos válidos: pi, pi/2, e, 2*e, phi, phi/2.`); }
        if(!Number.isFinite(valor)) throw new Error(`${nombre} no produce un número finito.`);
        return new RealVal(valor, normal.replace(/^\+/,''), latexConstanteEspecial(original));
    }
    add(o){ o = toFrac(o); return new RealVal(this.toNumber()+o.toNumber(), fmtRealPlain(this.toNumber()+o.toNumber()), `${this.toLatex()}+${o.toLatex()}`); }
    sub(o){ o = toFrac(o); return new RealVal(this.toNumber()-o.toNumber(), fmtRealPlain(this.toNumber()-o.toNumber()), `${this.toLatex()}-${o.toLatex()}`); }
    mul(o){ o = toFrac(o); return new RealVal(this.toNumber()*o.toNumber(), fmtRealPlain(this.toNumber()*o.toNumber()), `${this.toLatex()}${o.toLatex()}`); }
    div(o){ o = toFrac(o); if(Math.abs(o.toNumber()) < 1e-15) throw new Error('No se permite dividir entre cero.'); return new RealVal(this.toNumber()/o.toNumber(), fmtRealPlain(this.toNumber()/o.toNumber()), `\\frac{${this.toLatex()}}{${o.toLatex()}}`); }
    neg(){ return new RealVal(-this.valor, fmtRealPlain(-this.valor), `-${this.toLatex()}`); }
    abs(){ return new RealVal(Math.abs(this.valor), fmtRealPlain(Math.abs(this.valor)), this.valor < 0 ? this.toLatex().replace(/^-/, '') : this.toLatex()); }
    eq(o){ o = toFrac(o); return Math.abs(this.toNumber()-o.toNumber()) < 1e-12; }
    eqInt(v){ return Math.abs(this.toNumber()-Number(v)) < 1e-12; }
    isZero(){ return Math.abs(this.valor) < 1e-12; }
    isOne(){ return Math.abs(this.valor-1) < 1e-12; }
    isMinusOne(){ return Math.abs(this.valor+1) < 1e-12; }
    toNumber(){ return this.valor; }
    toPlain(){ return this.plain; }
    toLatex(){ return this.latex; }
    toSignedLatex(){ return this.toLatex(); }
}
function fmtRealPlain(x){
    if(Math.abs(x) < 1e-12) return '0';
    return Number(x.toPrecision(15)).toString();
}
function latexConstanteEspecial(texto){
    let s = String(texto || '').trim().replace(/π/g,'pi').replace(/[φϕ]/g,'phi').replace(/\s+/g,'').toLowerCase();
    const repl = v => v.replace(/phi/g,'\\varphi').replace(/pi/g,'\\pi').replace(/\be\b/g,'e');
    if(s === 'pi' || s === '+pi') return '\\pi';
    if(s === '-pi') return '-\\pi';
    if(s === 'e' || s === '+e') return 'e';
    if(s === '-e') return '-e';
    if(s === 'phi' || s === '+phi') return '\\varphi';
    if(s === '-phi') return '-\\varphi';
    let m = s.match(/^([+-]?)(pi|e|phi)\/(\d+(?:\.\d+)?)$/);
    if(m) return `${m[1] === '-' ? '-' : ''}\\frac{${repl(m[2])}}{${m[3]}}`;
    m = s.match(/^([+-]?\d+(?:\.\d+)?)\*?(pi|e|phi)$/);
    if(m) return `${m[1]}${repl(m[2])}`;
    m = s.match(/^([+-]?\d+(?:\.\d+)?)\*?(pi|e|phi)\/(\d+(?:\.\d+)?)$/);
    if(m) return `\\frac{${m[1]}${repl(m[2])}}{${m[3]}}`;
    return repl(s).replace(/\*/g,'');
}

function abs(n){ return n < 0n ? -n : n; }
function gcd(a,b){ while(b !== 0n){ const t = b; b = a % b; a = t; } return a || 1n; }
function toFrac(x){ return (x instanceof Frac || x instanceof RealVal) ? x : new Frac(BigInt(x)); }
function uno(){ return new Frac(1n,1n); }
function cero(){ return new Frac(0n,1n); }

const estados = {
    indef: [],
    def: [],
    cin: [],
    area1: [],
    area2: [],
    riemann: [],
    darboux: [],
    fp: []
};

function $(id){ return document.getElementById(id); }
function val(id){ const el = $(id); return el ? el.value : ''; }
const LIMITE_DIGITOS_ENTRADA = 10;
const LIMITE_TERMINOS_POLINOMIO = 10;
function contarDigitos(texto){ return (String(texto ?? '').match(/\d/g) || []).length; }
function etiquetaCampo(id,nombre='entrada'){
    const el=$(id);
    const label = el ? el.closest('.campo')?.querySelector('label')?.textContent?.trim() : '';
    return label || nombre || id || 'entrada';
}
function validarDigitosEntrada(valor,nombre='entrada'){
    if(contarDigitos(valor) > LIMITE_DIGITOS_ENTRADA){
        throw new Error(`Error: ${nombre} no puede exceder ${LIMITE_DIGITOS_ENTRADA} dígitos.`);
    }
}
function validarCampoDigitos(id,nombre='entrada'){
    validarDigitosEntrada(val(id), etiquetaCampo(id,nombre));
}
function parse(id,nombre){ validarCampoDigitos(id,nombre); return Frac.parse(val(id), nombre); }
function parseEnteroLimitado(id,nombre,defecto=''){
    const crudo = String(val(id) || defecto).trim();
    validarDigitosEntrada(crudo, etiquetaCampo(id,nombre));
    if(!/^[-+]?\d+$/.test(crudo)) throw new Error(`${nombre} debe ser un entero.`);
    return parseInt(crudo,10);
}
function advertirLimiteDigitosEnCampo(input){
    if(!input) return;
    const campo = input.closest('.campo');
    let aviso = campo ? campo.querySelector('.aviso-digitos') : null;
    if(!aviso && campo){
        aviso = document.createElement('div');
        aviso.className = 'aviso-digitos';
        campo.appendChild(aviso);
    }
    const excede = contarDigitos(input.value) > LIMITE_DIGITOS_ENTRADA;
    if(aviso){
        aviso.textContent = excede ? `Advertencia: este campo supera el máximo permitido de ${LIMITE_DIGITOS_ENTRADA} dígitos.` : '';
        aviso.style.display = excede ? 'block' : 'none';
    }
    input.classList.toggle('campo-exceso-digitos', excede);
}
function prepararValidacionDigitos(root=document){
    (root || document).querySelectorAll('input[data-max-digits="10"]').forEach(input=>{
        if(input.dataset.validaDigitos === '1') return;
        input.dataset.validaDigitos = '1';
        input.addEventListener('input', ()=>advertirLimiteDigitosEnCampo(input));
        advertirLimiteDigitosEnCampo(input);
    });
}
function fmtNum(x){ return Number.isFinite(x) ? (Math.abs(x) < 1e-12 ? '0' : Number(x.toFixed(8)).toString()) : 'Sin resultado numérico'; }
function fmtLatexNum(x){ return Number.isFinite(x) ? fmtNum(x) : String.raw`\text{Sin resultado numérico}`; }
function flatex(f){ return f.toLatex(); }
function renderMath(root=document.body){
    // KaTeX para renderizado rápido tipo Symbolab. Si la página no cargó KaTeX, se conserva MathJax.
    if(window.renderMathInElement){
        renderMathInElement(root || document.body, {
            delimiters: [
                {left: "\\[", right: "\\]", display: true},
                {left: "\\(", right: "\\)", display: false},
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false}
            ],
            throwOnError: false
        });
    }else if(window.MathJax && MathJax.typesetPromise){
        MathJax.typesetPromise(root ? [root] : undefined);
    }
}
function mostrarError(id,msg){ const cont = $(id); if(cont) cont.innerHTML = `<div class="error">${escapeHtml(msg)}</div>`; renderMath(cont); }
function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function limpiarResultado(id){ const cont = $(id); if(cont) cont.innerHTML = ''; }
function enlaceTeoria(nombre, url, descripcion=''){
    return `<div class="enlace-teoria"><b>${escapeHtml(nombre)}</b>${descripcion ? `: ${escapeHtml(descripcion)}` : ''}<br><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Abrir glosario.pdf</a></div>`;
}
function bloqueAdvertencia(texto){
    return `<div class="advertencia-calculo">${escapeHtml(texto)}</div>`;
}
function formulaTrapecioLatex(a,b,n,hLatex='h'){
    return String.raw`T_${n}=\frac{${hLatex}}{2}\left[f(${a})+2\sum_{i=1}^{${Number(n)-1}}f(x_i)+f(${b})\right]`;
}
function advertenciaAproximacion(n, extra=''){
    return `Aviso: este valor es aproximado, no exacto. Se usó la regla del trapecio con n=${n}. ${extra}`.trim();
}
function limpiarDiferencialAisladoRegla(latex){
    const original = String(latex || '').trim();
    const limpio = original.replace(/\\,/g,'').replace(/\\!/g,'').replace(/\s+/g,'').toLowerCase();
    // Solo borra diferenciales cuando aparecen solos dentro de una tarjeta de regla.
    // No toca diferenciales que formen parte correcta de una integral completa.
    if(['dx','dt','dy','dz','\\mathrm{d}x','\\mathrm{d}t'].includes(limpio)) return '';
    return original;
}
function normalizarPaso(p,i){
    const esRegla = i === 0;
    if(typeof p === 'string') return {titulo: esRegla ? 'Regla aplicada' : `Paso ${i}`, latex: esRegla ? limpiarDiferencialAisladoRegla(p) : p, explicacion:''};
    const titulo = p.titulo || (esRegla ? 'Regla aplicada' : `Paso ${i}`);
    const latexOriginal = p.latex || p.expresion_latex || '';
    return {
        titulo,
        latex: String(titulo).toLowerCase().includes('regla aplicada') ? limpiarDiferencialAisladoRegla(latexOriginal) : latexOriginal,
        explicacion: p.explicacion || '',
        tipo: p.tipo || 'calculo'
    };
}
function reglaParaTitulo(titulo){
    const t = String(titulo || '').toLowerCase();
    if(t.includes('cambio de variable')) return {titulo:'Regla aplicada', latex:String.raw`\int f(g(x))g'(x)\,dx=F(g(x))+C`, explicacion:'Se identifica la función interna g(x), se verifica que aparezca g\'(x) y se aplica la composición.'};
    if(t.includes('por partes')) return {titulo:'Regla aplicada', latex:String.raw`\int f(x)g'(x)\,dx=f(x)g(x)-\int f'(x)g(x)\,dx`, explicacion:'Se deriva un factor y se integra el otro para reducir el producto.'};
    if(t.includes('fracciones parciales')) return {titulo:'Regla aplicada', latex:String.raw`\frac{P(x)}{Q(x)}=\frac{A}{x-a}+\frac{B}{x-b}+\cdots`, explicacion:'Primero se descompone la función racional en fracciones simples.'};
    if(t.includes('potencia')) return {titulo:'Regla aplicada', latex:String.raw`\int kx^n\,dx=\frac{kx^{n+1}}{n+1}+C,\quad n\ne -1`, explicacion:'Se aumenta el exponente en 1 y se divide entre el nuevo exponente.'};
    if(t.includes('constante')) return {titulo:'Regla aplicada', latex:String.raw`\int k\,dx=kx+C`, explicacion:'Una constante se multiplica por la variable de integración.'};
    if(t.includes('polinomio')) return {titulo:'Regla aplicada', latex:String.raw`\int (a_nx^n+\cdots+a_1x+a_0)\,dx=\sum \frac{a_i x^{i+1}}{i+1}+C`, explicacion:'Se integra cada término del polinomio por separado.'};
    if(t.includes('trigonométrica') || t.includes('trigonometrica')) return {titulo:'Regla aplicada', latex:String.raw`\int \operatorname{sen}(x)\,dx=-\cos(x)+C,\quad \int \cos(x)\,dx=\operatorname{sen}(x)+C`, explicacion:'Se aplica la tabla de integrales trigonométricas del glosario.'};
    if(t.includes('logarítmica') || t.includes('logaritmica')) return {titulo:'Regla aplicada', latex:String.raw`\int \frac{1}{x}\,dx=\log|x|+C`, explicacion:'La forma 1/x produce una integral logarítmica.'};
    if(t.includes('exponencial')) return {titulo:'Regla aplicada', latex:String.raw`\int e^{kx}\,dx=\frac{1}{k}e^{kx}+C`, explicacion:'Se usa la regla de integrales exponenciales.'};
    if(t.includes('integración general') || t.includes('integracion general')) return {titulo:'Regla aplicada', latex:String.raw`\int f(x)\,dx=F(x)+C`, explicacion:'Se busca una primitiva simbólica como respaldo cuando no hay un patrón específico.'};
    return null;
}
function separarReglaYPasos(lineas){
    const normalizados = (lineas || []).map((p,i)=>normalizarPaso(p,i));
    if(!normalizados.length) return {regla:null,pasos:[]};
    const [regla, ...resto] = normalizados;
    const pasos = resto.map((p,i)=>({
        ...p,
        titulo: /^Paso\s*\d+\s*:?/i.test(p.titulo || '') || !p.titulo ? `Paso ${i+1}` : p.titulo
    }));
    return {regla, pasos};
}
function resultadoFinalHTML(resultado){
    if(!resultado) return '';
    return `<div class="resultado-final"><b>Resultado final:</b><div class="paso-latex">\\[${resultado}\\]</div></div>`;
}
function pasosHTML(titulo,lineas,extra=''){
    const {regla, pasos} = separarReglaYPasos(lineas);
    const reglaHTML = regla ? `
        <div class="regla-aplicada">
            <div class="regla-etiqueta">Regla aplicada</div>
            ${regla.explicacion ? `<p class="paso-explicacion">${escapeHtml(regla.explicacion)}</p>` : ''}
            ${regla.latex ? `<div class="paso-latex">\\[${regla.latex}\\]</div>` : ''}
        </div>` : '';
    const items = pasos.map((p,i) => `
        <div class="paso-card ${escapeHtml(p.tipo || 'calculo')}">
            <button type="button" class="paso-toggle" onclick="this.parentElement.classList.toggle('cerrado')">
                <span>${escapeHtml(p.titulo || `Paso ${i+1}`)}</span><span>Mostrar/Ocultar</span>
            </button>
            ${p.explicacion ? `<p class="paso-explicacion">${escapeHtml(p.explicacion)}</p>` : ''}
            <div class="paso-latex">\\[${p.latex}\\]</div>
        </div>`).join('');
    const pasosHTMLInterno = pasos.length ? `<div class="pasos-seccion"><h4>Desarrollo paso a paso</h4>${items}</div>` : '';
    return `<div class="resultado resultado-symbolab"><h3>${escapeHtml(titulo)}</h3>${reglaHTML}${pasosHTMLInterno}${extra}</div>`;
}
function mostrarPasos(id,titulo,lineas,extra=''){
    const cont = $(id); if(!cont) return;
    cont.innerHTML = pasosHTML(titulo,lineas,extra);
    renderMath(cont);
}

function formatearNombreMetodo(nombre){
    let s = String(nombre || '').trim();
    if(!s) return '';
    s = s.replace(/_/g,'-');
    s = s.replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g,'$1 $2');
    s = s.replace(/([A-ZÁÉÍÓÚÑ]+)([A-ZÁÉÍÓÚÑ][a-záéíóúñ])/g,'$1 $2');
    s = s.replace(/-/g,' ');
    s = s.replace(/\s+/g,' ').trim();
    const mapa = {
        'fracciones parciales':'Fracciones parciales',
        'cambio variable':'Cambio de variable',
        'cambio de variable':'Cambio de variable',
        'por partes':'Integración por partes',
        'integracion por partes':'Integración por partes',
        'sustitucion trigonometrica':'Sustitución trigonométrica',
        'sustitución trigonométrica':'Sustitución trigonométrica',
        'polinomio':'Polinomio',
        'potencia':'Regla de potencia',
        'constante':'Integral de constante',
        'trigonometrica':'Integral trigonométrica',
        'trigonométrica':'Integral trigonométrica',
        'exponencial':'Integral exponencial',
        'logaritmica':'Integral logarítmica',
        'logarítmica':'Integral logarítmica'
    };
    const key = s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    if(mapa[key]) return mapa[key];
    return s.charAt(0).toUpperCase()+s.slice(1);
}

function mostrarRespuestaAPI(id,titulo,data){
    const pasosOriginales = data.pasos_detallados || data.pasos || [];
    const regla = reglaParaTitulo(titulo);
    const pasos = regla ? [regla, ...pasosOriginales] : pasosOriginales;
    const resultado = data.resultado_latex || data.resultado || '';
    const advertencias = Array.isArray(data.advertencias)
        ? data.advertencias.filter(Boolean).map(txt=>bloqueAdvertencia(txt)).join('')
        : '';
    const extra = `${advertencias}${resultadoFinalHTML(resultado)}`;
    mostrarPasos(id,titulo,pasos,extra);
}
function buscarParentesisCierre(s, inicio){
    let profundidad = 0;
    for(let i=inicio; i<s.length; i++){
        if(s[i] === '(') profundidad++;
        else if(s[i] === ')'){
            profundidad--;
            if(profundidad === 0) return i;
        }
    }
    return -1;
}
function convertirFuncionesLatex(s){
    const comandos = {
        sen: '\\operatorname{sen}',
        sin: '\\operatorname{sen}',
        cos: '\\cos',
        tan: '\\tan',
        sec: '\\sec',
        csc: '\\csc',
        cot: '\\cot',
        arcsen: '\\operatorname{arcsen}',
        arcsin: '\\operatorname{arcsen}',
        arccos: '\\arccos',
        arctan: '\\arctan',
        log: '\\log',
        exp: '\\exp',
        sqrt: '\\sqrt'
    };
    let salida = '';
    for(let i=0; i<s.length;){
        const letra = /[A-Za-z]/.test(s[i]);
        if(!letra){
            salida += s[i];
            i++;
            continue;
        }

        let fin = i + 1;
        while(fin < s.length && /[A-Za-z]/.test(s[fin])) fin++;
        const palabra = s.slice(i, fin);
        const clave = palabra.toLowerCase();
        let j = fin;
        while(j < s.length && /\s/.test(s[j])) j++;

        if(comandos[clave] && s[j] === '('){
            const cierre = buscarParentesisCierre(s, j);
            if(cierre !== -1){
                const argumento = convertirFuncionesLatex(s.slice(j + 1, cierre));
                salida += clave === 'sqrt'
                    ? `${comandos[clave]}{${argumento}}`
                    : `${comandos[clave]}\\left(${argumento}\\right)`;
                i = cierre + 1;
                continue;
            }
        }

        salida += palabra;
        i = fin;
    }
    return salida;
}
function latexUsuarioBasico(texto){
    let s = String(texto || '').trim();
    if(!s) return '';
    s = s.replace(/\*/g, '');
    s = convertirFuncionesLatex(s);
    s = s.replace(/\(([^()]+)\)\/\(([^()]+)\)/g, '\\frac{$1}{$2}');
    s = s.replace(/([A-Za-z0-9}\\)]+)\/(\d+|[A-Za-z]+)/g, '\\frac{$1}{$2}');
    s = s.replace(/\^\(([^()]+)\)/g, '^{$1}');
    s = s.replace(/\^([-+]?\d+(?:\.\d+)?|[A-Za-z])/g, '^{$1}');
    return s;
}
function actualizarVistaLatex(inputId, previewId, envolverIntegral=false){
    const input = $(inputId), preview = $(previewId);
    if(!input || !preview) return;
    const cuerpo = latexUsuarioBasico(input.value);
    const latex = cuerpo ? (envolverIntegral ? `\\int ${cuerpo}\\,dx` : cuerpo) : '\\text{Escribe una expresión}';
    preview.innerHTML = `\\[${latex}\\]`;
    renderMath(preview);
}
function insertarMath(inputId, texto){
    const input = $(inputId); if(!input) return;
    const ini = input.selectionStart ?? input.value.length;
    const fin = input.selectionEnd ?? input.value.length;
    input.value = input.value.slice(0,ini) + texto + input.value.slice(fin);
    const pos = ini + texto.length;
    input.focus(); input.setSelectionRange(pos,pos);
    input.dispatchEvent(new Event('input'));
}
function tecladoMath(inputId){
    const botones = [
        ['∫','\\int '], ['dx',' dx'], ['x²','x^2'], ['xⁿ','x^()'],
        ['√','sqrt()'], ['frac','\\frac{}{}'], ['sen','sen()'], ['cos','cos()'],
        ['tan','tan()'], ['log','log()'], ['e^x','exp(x)'], ['π','pi'], ['e','e'], ['φ','phi']
    ];
    return `<div class="teclado-math">${botones.map(([t,v])=>`<button type="button" class="tecla-math" onclick="Calculadora.insertarMath('${inputId}','${v.replace(/\\/g,'\\\\')}')">${t}</button>`).join('')}</div>`;
}
function inputMath(label,id,placeholder='',envolverIntegral=true){
    const preview = `${id}-preview`;
    return `<div class="campo campo-math"><label>${label}</label><input id="${id}" type="text" placeholder="${placeholder}" oninput="Calculadora.actualizarVistaLatex('${id}','${preview}',${envolverIntegral})"><div id="${preview}" class="preview-latex">\\[\\text{Escribe una expresión}\\]</div>${tecladoMath(id)}</div>`;
}

function obtenerBasesAPI(){
    const params = new URLSearchParams(window.location.search || '');
    const apiQuery = params.get('api');
    if(apiQuery){
        try{ localStorage.setItem('CALCULADORA_API_URL', apiQuery); }catch(_){}
    }
    const apiConfigurada = [
        window.CALCULADORA_API_URL,
        apiQuery,
        (()=>{ try{ return localStorage.getItem('CALCULADORA_API_URL'); }catch(_){ return ''; } })()
    ].find(url => typeof url === 'string' && url.trim());

    return [
        apiConfigurada,
        'http://127.0.0.1:8000',
        'http://localhost:8000'
    ].filter(Boolean).map(url => String(url).replace(/\/+$/, ''));
}
const API_BASES = obtenerBasesAPI();
async function pedirAPI(ruta, datos){
    let ultimoError = null;
    for(const base of API_BASES){
        let respuesta;
        try{
            respuesta = await fetch(`${base}${ruta}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(datos)
            });
        }catch(error){
            ultimoError = error;
            console.warn(`No se pudo conectar con ${base}${ruta}`, error);
            continue;
        }

        let json;
        try{
            json = await respuesta.json();
        }catch(errorJson){
            console.error('El backend respondió, pero no devolvió JSON válido.', errorJson, respuesta);
            throw new Error('El backend respondió, pero la respuesta no es JSON válido. Revisa la consola y la terminal de uvicorn.');
        }

        if(!respuesta.ok){
            console.error('Error devuelto por el backend:', respuesta.status, json);
            const detalle = json.detail || json.error || 'El backend no pudo resolver la integral.';
            throw new Error(`Error del backend (${respuesta.status}): ${detalle}`);
        }
        return json;
    }
    console.error('No se pudo conectar con ninguna URL del backend.', ultimoError);
    throw new Error('No pude conectarme con el backend. Abre una terminal en backend-python/CalculadoraDeIntegrales, instala dependencias con pip install -r requirements.txt y ejecuta: python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000');
}
function productoLatex(k, expr){
    k = toFrac(k);
    if(k.isZero()) return '0';
    if(k.isOne()) return expr;
    if(k.isMinusOne()) return `-${exprConPar(expr)}`;
    return `${k.toLatex()}${exprConPar(expr)}`;
}
function exprConPar(expr){
    if(/^[a-zA-Z]+\(?[a-zA-Z0-9]*\)?$/.test(expr) || /^e\^/.test(expr) || /^x\^/.test(expr) || expr === 'x' || /^\\/.test(expr)) return expr;
    return `\\left(${expr}\\right)`;
}
function potenciaVar(v, exp){
    exp = toFrac(exp);
    if(exp.eqInt(0)) return '1';
    if(exp.eqInt(1)) return v;
    return `${v}^{${exp.toLatex()}}`;
}
function terminoLatex(coef, exp, variable='x'){
    coef = toFrac(coef); exp = toFrac(exp);
    if(coef.isZero()) return '0';
    if(exp.eqInt(0)) return coef.toLatex();
    const p = potenciaVar(variable, exp);
    if(coef.isOne()) return p;
    if(coef.isMinusOne()) return `-${p}`;
    return `${coef.toLatex()}${p}`;
}
function unirTerminosLatex(terminos){
    const limpios = terminos.filter(t => t && t !== '0');
    if(!limpios.length) return '0';
    let out = limpios[0];
    for(const t of limpios.slice(1)){
        if(t.startsWith('-')) out += ' - ' + t.slice(1);
        else out += ' + ' + t;
    }
    return out;
}
function polinomioLatex(terms, variable='x'){
    return unirTerminosLatex(terms.map(t => terminoLatex(t.c, t.e, variable)));
}
function antiderivadaTermino(coef, exp, variable='x', definida=false){
    coef = toFrac(coef); exp = toFrac(exp);
    if(coef.isZero()) return '0';
    if(exp.eqInt(-1)) return productoLatex(coef, `\\log\\left|${variable}\\right|`);
    const nuevo = exp.add(uno());
    const nuevoCoef = coef.div(nuevo);
    if(nuevoCoef.isZero()) return '0';
    const p = potenciaVar(variable, nuevo);
    if(nuevoCoef.isOne()) return p;
    if(nuevoCoef.isMinusOne()) return `-${p}`;
    return `${nuevoCoef.toLatex()}${p}`;
}
function antiderivadaPolinomio(terms, variable='x'){
    return unirTerminosLatex(terms.map(t => antiderivadaTermino(t.c, t.e, variable)));
}
function evaluarTermino(coef, exp, x){
    coef = toFrac(coef); exp = toFrac(exp);
    if(exp.eqInt(-1)){
        if(x === 0) throw new Error('El intervalo no puede contener x = 0 cuando aparece x^{-1}.');
        return coef.toNumber() * Math.log(Math.abs(x));
    }
    return coef.toNumber() * Math.pow(x, exp.add(uno()).toNumber()) / exp.add(uno()).toNumber();
}
function valorPolinomio(terms, x){ return terms.reduce((s,t) => s + t.c.toNumber()*Math.pow(x, t.e.toNumber()), 0); }
function definitePoly(terms,a,b){ return terms.reduce((s,t)=>s + (evaluarTermino(t.c,t.e,b)-evaluarTermino(t.c,t.e,a)),0); }
function intervaloContieneCero(a,b){ return Math.min(a,b) <= 0 && Math.max(a,b) >= 0; }

function addTerm(listaId, estadoKey, coefId, expId, variable='x'){
    try{
        if((estados[estadoKey] || []).length >= LIMITE_TERMINOS_POLINOMIO){
            throw new Error(`Solo se permiten como máximo ${LIMITE_TERMINOS_POLINOMIO} términos en el polinomio.`);
        }
        const c = parse(coefId, 'coeficiente');
        const e = parse(expId, 'exponente');
        estados[estadoKey].push({c,e});
        actualizarLista(listaId, estadoKey, variable);
        limpiarResultado(listaId.replace('lista','resultado'));
    }catch(err){ mostrarError(listaId, err.message); }
}
function clearTerms(listaId, estadoKey){ estados[estadoKey] = []; actualizarLista(listaId, estadoKey); }
function actualizarLista(listaId, estadoKey, variable='x'){
    const el = $(listaId); if(!el) return;
    if(!estados[estadoKey].length){ el.innerHTML = '<em>Aún no hay términos agregados.</em>'; return; }
    el.innerHTML = `\\(${polinomioLatex(estados[estadoKey], variable)}\\)` +
        '<br><small>Lista interna: ' + estados[estadoKey].map(t => `(${t.c.toPlain()}, ${t.e.toPlain()})`).join(', ') + '</small>';
    renderMath();
}


function parseListaFracciones(texto,nombre){
    const crudo = String(texto || '').trim();
    validarDigitosEntrada(crudo, nombre);
    if(!crudo) throw new Error(`${nombre} no puede estar vacío.`);
    return crudo.split(/[;,\s]+/).filter(Boolean).map((p,i)=>Frac.parse(p, `${nombre} ${i+1}`));
}
function validarParticion(P){
    if(P.length < 2) throw new Error('La partición debe tener al menos dos puntos.');
    for(let i=1;i<P.length;i++){
        if(P[i].toNumber() <= P[i-1].toNumber()) throw new Error('La partición debe estar ordenada de menor a mayor y sin puntos repetidos.');
    }
}
function refinarParticion(P,factor){
    if(factor <= 1) return P.slice();
    const out=[];
    for(let i=0;i<P.length-1;i++){
        const a=P[i], b=P[i+1];
        if(i===0) out.push(a);
        const paso = b.sub(a).div(new Frac(BigInt(factor),1n));
        for(let j=1;j<=factor;j++) out.push(a.add(paso.mul(new Frac(BigInt(j),1n))));
    }
    return out;
}
function listaLatex(arr){ return arr.map(x=>x.toLatex()).join(', '); }
function conjuntoLatex(nombre, arr){ return `${nombre}=\\{${listaLatex(arr)}\\}`; }
function valorFinito(f,x,contexto='valor'){
    const y = f(x);
    if(!Number.isFinite(y)) throw new Error(`No se pudo calcular ${contexto}: la función dio infinito o NaN en x=${fmtNum(x)}.`);
    return y;
}
function expresionRiemannLatex(P, xis){
    const terminos = [];
    for(let i=1;i<P.length;i++){
        terminos.push(`f\\left(${xis[i-1].toLatex()}\\right)\\left(${P[i].toLatex()}-${P[i-1].toLatex()}\\right)`);
    }
    if(terminos.length <= 10) return terminos.join('+');
    return String.raw`\sum_{i=1}^{${P.length-1}} f(s_i)(t_i-t_{i-1})`;
}
function descripcionSeleccionRiemann(metodo){
    if(metodo === 'izquierda') return 'puntos izquierdos';
    if(metodo === 'derecha') return 'puntos derechos';
    if(metodo === 'media') return 'puntos medios';
    return 'selección manual';
}
function tablaRiemann(f,P,xis){
    let filas=''; let suma=0;
    for(let i=1;i<P.length;i++){
        const ancho=P[i].sub(P[i-1]).toNumber();
        const si=xis[i-1].toNumber();
        const valf=valorFinito(f, si, `f(s_${i})`);
        const parcial=valf*ancho; suma+=parcial;
        const termino = `f\\left(${xis[i-1].toLatex()}\\right)\\left(${P[i].toLatex()}-${P[i-1].toLatex()}\\right)`;
        filas += `<tr><td>\\([${P[i-1].toLatex()},${P[i].toLatex()}]\\)</td><td>\\(${xis[i-1].toLatex()}\\)</td><td>\\(${termino}\\)</td><td>\\(${fmtNum(valf)}\\)</td><td>\\(${fmtNum(ancho)}\\)</td><td>\\(${fmtNum(parcial)}\\)</td></tr>`;
    }
    return {suma, html:`<div class="tabla-glosario-contenedor"><table><thead><tr><th>Subintervalo \\([t_{i-1},t_i]\\)</th><th>Selección \\(s_i\\)</th><th>Término \\(f(s_i)(t_i-t_{i-1})\\)</th><th>\\(f(s_i)\\)</th><th>\\(t_i-t_{i-1}\\)</th><th>Producto</th></tr></thead><tbody>${filas}</tbody></table></div>`};
}
function tablaDarboux(f,P,muestras){
    let filas='', inferior=0, superior=0, infs=[], sups=[], rects=[];
    for(let i=1;i<P.length;i++){
        const a=P[i-1].toNumber(), b=P[i].toNumber(), ancho=b-a;
        const vals=[];
        for(let k=0;k<=muestras;k++){
            const x=a + (ancho*k/muestras);
            const y=f(x);
            if(Number.isFinite(y)) vals.push(y);
        }
        if(!vals.length) throw new Error(`No se pudieron aproximar ínfimo/supremo en [${P[i-1].toPlain()}, ${P[i].toPlain()}] porque la función no dio valores finitos.`);
        const mn=Math.min(...vals), mx=Math.max(...vals);
        infs.push(mn); sups.push(mx); rects.push({a,b,mn,mx});
        inferior += mn*ancho; superior += mx*ancho;
        filas += `<tr><td>\\([${P[i-1].toLatex()}, ${P[i].toLatex()}]\\)</td><td>${fmtNum(mn)}</td><td>${fmtNum(mx)}</td><td>${fmtNum(ancho)}</td><td>${fmtNum(mn*ancho)}</td><td>${fmtNum(mx*ancho)}</td></tr>`;
    }
    return {inferior, superior, infimoGlobal:Math.min(...infs), supremoGlobal:Math.max(...sups), rects, html:`<div class="tabla-glosario-contenedor"><table><thead><tr><th>Subintervalo</th><th>\\(m_i\\)</th><th>\\(M_i\\)</th><th>Anchura</th><th>\\(m_i\\cdot\\text{anchura}\\)</th><th>\\(M_i\\cdot\\text{anchura}\\)</th></tr></thead><tbody>${filas}</tbody></table></div>`};
}

function parseCoeficienteOpcional(s,nombre){
    if(s === '' || s === '+') return uno();
    if(s === '-') return new Frac(-1n,1n);
    return Frac.parse(s,nombre);
}
function splitTerminosNivelPrincipal(expr){
    const s=String(expr||'').replace(/\s+/g,'');
    if(!s) return [];
    const partes=[]; let inicio=0, nivel=0;
    for(let i=0;i<s.length;i++){
        const c=s[i];
        if(c==='(') nivel++;
        else if(c===')') nivel--;
        else if(i>0 && nivel===0 && (c==='+' || c==='-')){ partes.push(s.slice(inicio,i)); inicio=i; }
    }
    partes.push(s.slice(inicio));
    return partes.filter(Boolean);
}
function parseDenominadorLineal(den){
    den=den.replace(/\*/g,'');
    const idx=den.indexOf('x');
    if(idx < 0) throw new Error('Cada denominador debe ser lineal y contener x, por ejemplo x-2 o 2x+1.');
    const antes=den.slice(0,idx);
    const despues=den.slice(idx+1);
    const a=parseCoeficienteOpcional(antes,'coeficiente de x');
    const b=despues ? Frac.parse(despues,'término independiente') : cero();
    if(a.isZero()) throw new Error('El coeficiente de x no puede ser cero.');
    return {a,b};
}
function latexLineal(a,b){
    let s='';
    if(a.isOne()) s='x'; else if(a.isMinusOne()) s='-x'; else s=`${a.toLatex()}x`;
    if(!b.isZero()) s += (b.n>=0n ? '+' : '-') + b.abs().toLatex();
    return s;
}
function parseTerminoFraccionParcial(t){
    const m=t.match(/^([+-]?(?:\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?)?)\/(?:\((.+)\)|(.+))$/);
    if(!m) throw new Error(`No pude leer el término ${t}. Usa formato como 3/(x-2), -5/(x+1), 2/(2x+3) o 1/x.`);
    const A=parseCoeficienteOpcional(m[1],'A');
    const den=m[2] || m[3];
    const {a,b}=parseDenominadorLineal(den);
    return {A,a,b};
}

function renderIndefForm(){
    const tipo = val('tipo-indef');
    const zona = $('form-indef');
    limpiarResultado('resultado-indef');
    if(!zona) return;
    if(tipo === 'constante'){
        zona.innerHTML = grid([
            campo('Constante k','k-indef','text','Ej. 5, -2.5, 3/4')
        ], 'Calculadora.calcularIndefConstante()');
    }else if(tipo === 'potencia'){
        zona.innerHTML = grid([
            campo('Exponente n','n-indef','text','Ej. 2, -1/2, 3.5')
        ], 'Calculadora.calcularIndefPotencia()');
    }else if(tipo === 'polinomio'){
        estados.indef = [];
        zona.innerHTML = `<div class="ayuda">Agrega cada término como coeficiente y exponente. Máximo 10 términos; coeficientes y exponentes con máximo 10 cifras. Ejemplo: para \\(3x^2-5x+7\\), agrega \\(3,2\\), \\(-5,1\\), \\(7,0\\). En indefinidas se respeta la restricción \\(n\\neq -1\\).</div>`+
        `<div class="grid-form">${campo('Coeficiente','coef-indef','text','Ej. 3/4')}${campo('Exponente','exp-indef','text','Ej. 2')}</div>`+
        `<div class="botones"><button type="button" onclick="Calculadora.addTerm('lista-indef','indef','coef-indef','exp-indef')">Agregar término</button><button type="button" class="secundario" onclick="Calculadora.clearTerms('lista-indef','indef')">Borrar polinomio</button><button type="button" onclick="Calculadora.calcularIndefPolinomio()">Calcular integral</button></div>`+
        `<div id="lista-indef" class="lista-terminos"><em>Aún no hay términos agregados.</em></div>`;
    }else if(tipo === 'trig'){
        zona.innerHTML = `<div class="grid-form"><div class="campo"><label>Función</label><select id="fun-trig"><option value="sen">sen(x)</option><option value="cos">cos(x)</option><option value="tan">tan(x)</option><option value="arcsen">arcsen(x)</option><option value="arccos">arccos(x)</option><option value="arctan">arctan(x)</option></select></div>${campo('Constante que multiplica k','k-trig','text','Ej. 1, -2, 3/4')}</div><div class="botones"><button type="button" onclick="Calculadora.calcularIndefTrig()">Calcular integral</button></div>`;
    }else if(tipo === 'log'){
        zona.innerHTML = `<div class="grid-form"><div class="campo"><label>Tipo</label><select id="tipo-log" onchange="Calculadora.toggleLogAx()"><option value="kx">k/x</option><option value="logx">k log(x)</option><option value="logax">log(ax)</option></select></div>${campo('Constante k','k-log','text','Ej. 1, 3/4')}<div class="campo" id="campo-a-log"><label>Valor de a en log(ax)</label><input id="a-log" type="text" placeholder="Ej. 2" data-max-digits="10" oninput="Calculadora.advertirLimiteDigitosEnCampo(this)"></div></div><div class="botones"><button type="button" onclick="Calculadora.calcularIndefLog()">Calcular integral</button></div>`; toggleLogAx();
    }else if(tipo === 'exp'){
        zona.innerHTML = grid([campo('Constante k en k e^x','k-exp','text','Ej. 1, -2, 3/4')], 'Calculadora.calcularIndefExp()');
    }
    renderMath();
}
function botonesConstantesCampo(id){
    return `<div class="teclado-math teclado-pi boton-pi-entrada constantes-entrada"><button type="button" class="tecla-math" onclick="Calculadora.insertarMath('${id}','pi')">π</button><button type="button" class="tecla-math" onclick="Calculadora.insertarMath('${id}','e')">e</button><button type="button" class="tecla-math" onclick="Calculadora.insertarMath('${id}','phi')">φ</button></div>`;
}
function campo(label,id,type='text',placeholder=''){
    const constantes = type === 'text' ? botonesConstantesCampo(id) : '';
    return `<div class="campo"><label>${label}</label><input id="${id}" type="${type}" placeholder="${placeholder}" data-max-digits="10" oninput="Calculadora.advertirLimiteDigitosEnCampo(this)">${constantes}</div>`;
}
function grid(campos, fn){ return `<div class="grid-form">${campos.join('')}</div><div class="botones"><button type="button" onclick="${fn}">Calcular integral</button></div>`; }
function toggleLogAx(){ const el=$('campo-a-log'); if(el) el.style.display = val('tipo-log') === 'logax' ? 'block' : 'none'; }
function calcularIndefConstante(){
    try{
        const k = parse('k-indef','k');
        let res = k.isZero() ? 'C' : `${productoLatex(k,'x')}+C`;
        mostrarPasos('resultado-indef','Integral indefinida de una constante',[
            String.raw`\int k\,dx=kx+C`,
            String.raw`f(x)=${k.toLatex()}`,
            String.raw`\int ${k.toLatex()}\,dx=${res}`
        ], resultadoFinalHTML(res));
    }catch(err){ mostrarError('resultado-indef',err.message); }
}

function calcularIndefPotencia(){
    try{
        const n = parse('n-indef','n');
        if(n.eqInt(-1)) throw new Error('El exponente debe ser distinto de -1 para esta regla. Usa la integral logarítmica para 1/x.');
        const F = antiderivadaTermino(uno(), n);
        const res = `${F}+C`;
        mostrarPasos('resultado-indef','Integral indefinida de x^n',[
            String.raw`\int x^n\,dx=\frac{x^{n+1}}{n+1}+C,\quad n\neq -1`,
            String.raw`f(x)=x^{${n.toLatex()}}`,
            String.raw`n+1=${n.add(uno()).toLatex()}`,
            String.raw`\int x^{${n.toLatex()}}\,dx=${res}`
        ], resultadoFinalHTML(res));
    }catch(err){ mostrarError('resultado-indef',err.message); }
}

function calcularIndefPolinomio(){
    try{
        if(!estados.indef.length) throw new Error('Agrega al menos un término al polinomio.');
        for(const t of estados.indef){ if(t.e.eqInt(-1)) throw new Error('En integral indefinida de polinomio, el exponente debe ser distinto de -1.'); }
        const P = polinomioLatex(estados.indef);
        const F = antiderivadaPolinomio(estados.indef);
        const res = `${F}+C`;
        mostrarPasos('resultado-indef','Integral indefinida de un polinomio',[
            String.raw`\int (a_1x^{n_1}+a_2x^{n_2}+\cdots)\,dx=\sum \int a_ix^{n_i}\,dx`,
            String.raw`P(x)=${P}`,
            String.raw`\int P(x)\,dx=\int\left(${P}\right)\,dx`,
            String.raw`\int\left(${P}\right)\,dx=${res}`
        ], resultadoFinalHTML(res));
    }catch(err){ mostrarError('resultado-indef',err.message); }
}

function calcularIndefTrig(){
    try{
        const k = parse('k-trig','k'); const f = val('fun-trig');
        const reglas = {
            sen: [String.raw`\int \operatorname{sen}(x)\,dx=-\cos(x)+C`, String.raw`\operatorname{sen}(x)`, String.raw`-\cos(x)`, `-${exprConPar(productoLatex(k,'\\cos(x)'))}`],
            cos: [String.raw`\int \cos(x)\,dx=\operatorname{sen}(x)+C`, String.raw`\cos(x)`, String.raw`\operatorname{sen}(x)`, productoLatex(k,String.raw`\operatorname{sen}(x)`) ],
            tan: [String.raw`\int \tan(x)\,dx=-\log|\cos(x)|+C`, String.raw`\tan(x)`, String.raw`-\log\left|\cos(x)\right|`, productoLatex(k,String.raw`-\log\left|\cos(x)\right|`) ],
            arcsen: [String.raw`\int \operatorname{arcsen}(x)\,dx=x\operatorname{arcsen}(x)+\sqrt{1-x^2}+C`, String.raw`\operatorname{arcsen}(x)`, String.raw`x\operatorname{arcsen}(x)+\sqrt{1-x^2}`, productoLatex(k,String.raw`x\operatorname{arcsen}(x)+\sqrt{1-x^2}`)],
            arccos: [String.raw`\int \operatorname{arccos}(x)\,dx=x\operatorname{arccos}(x)-\sqrt{1-x^2}+C`, String.raw`\operatorname{arccos}(x)`, String.raw`x\operatorname{arccos}(x)-\sqrt{1-x^2}`, productoLatex(k,String.raw`x\operatorname{arccos}(x)-\sqrt{1-x^2}`)],
            arctan: [String.raw`\int \operatorname{arctan}(x)\,dx=x\operatorname{arctan}(x)-\frac12\log(1+x^2)+C`, String.raw`\operatorname{arctan}(x)`, String.raw`x\operatorname{arctan}(x)-\frac{1}{2}\log(1+x^2)`, productoLatex(k,String.raw`x\operatorname{arctan}(x)-\frac{1}{2}\log(1+x^2)`)]
        };
        const r = reglas[f];
        const res = `${r[3]}+C`;
        mostrarPasos('resultado-indef','Integral trigonométrica',[
            r[0],
            String.raw`f(x)=${productoLatex(k,r[1])}`,
            String.raw`\int ${r[1]}\,dx=${r[2]}+C`,
            String.raw`\int ${productoLatex(k,r[1])}\,dx=${res}`
        ], resultadoFinalHTML(res));
    }catch(err){ mostrarError('resultado-indef',err.message); }
}

function calcularIndefLog(){
    try{
        const tipo = val('tipo-log'); const k = parse('k-log','k');
        let pasos, res;
        if(tipo === 'kx'){
            res = `${productoLatex(k,String.raw`\log\left|x\right|`)}+C`;
            pasos = [String.raw`\int \frac{k}{x}\,dx=k\log|x|+C`, String.raw`f(x)=\frac{${k.toLatex()}}{x}`, String.raw`\int \frac{${k.toLatex()}}{x}\,dx=${res}`];
        }else if(tipo === 'logx'){
            res = `${productoLatex(k,String.raw`x\log(x)-x`)}+C`;
            pasos = [String.raw`\int \log(x)\,dx=x\log(x)-x+C`, String.raw`f(x)=${productoLatex(k,String.raw`\log(x)`)}`, String.raw`\int ${productoLatex(k,String.raw`\log(x)`)}\,dx=${res}`];
        }else{
            const a = parse('a-log','a'); if(a.isZero()) throw new Error('El valor de a debe ser distinto de 0.');
            res = String.raw`x\log(${a.toLatex()}x)-x+C`;
            pasos = [String.raw`\int \log(ax)\,dx=x\log(ax)-x+C`, String.raw`f(x)=\log(${a.toLatex()}x)`, String.raw`\int \log(${a.toLatex()}x)\,dx=${res}`];
        }
        mostrarPasos('resultado-indef','Integral logarítmica',pasos, resultadoFinalHTML(res));
    }catch(err){ mostrarError('resultado-indef',err.message); }
}

function calcularIndefExp(){
    try{
        const k = parse('k-exp','k');
        const res = `${productoLatex(k,'e^x')}+C`;
        mostrarPasos('resultado-indef','Integral exponencial',[
            String.raw`\int e^x\,dx=e^x+C`,
            String.raw`f(x)=${productoLatex(k,'e^x')}`,
            String.raw`\int ${productoLatex(k,'e^x')}\,dx=${res}`
        ], resultadoFinalHTML(res));
    }catch(err){ mostrarError('resultado-indef',err.message); }
}

function renderDefForm(){
    const tipo = val('tipo-def'); const zona = $('form-def'); limpiarResultado('resultado-def'); if(!zona) return;
    const limites = campo('Límite inferior a','a-def','text','Ej. 0') + campo('Límite superior b','b-def','text','Ej. 1');
    if(tipo === 'constante') zona.innerHTML = grid([campo('Constante k','k-def','text','Ej. 5'), limites], 'Calculadora.calcularDefConstante()');
    else if(tipo === 'potencia') zona.innerHTML = grid([campo('Exponente n','n-def','text','Ej. 2 o -1'), limites], 'Calculadora.calcularDefPotencia()');
    else if(tipo === 'polinomio'){
        estados.def=[];
        zona.innerHTML = `<div class="ayuda">Agrega cada término del polinomio. Máximo 10 términos; coeficientes y exponentes con máximo 10 cifras. Para definidas sí se permite \\(x^{-1}\\), pero el intervalo no puede contener \\(0\\).</div><div class="grid-form">${campo('Coeficiente','coef-def','text','Ej. 3/4')}${campo('Exponente','exp-def','text','Ej. 2')}</div><div class="botones"><button type="button" onclick="Calculadora.addTerm('lista-def','def','coef-def','exp-def')">Agregar término</button><button type="button" class="secundario" onclick="Calculadora.clearTerms('lista-def','def')">Borrar polinomio</button></div><div id="lista-def" class="lista-terminos"><em>Aún no hay términos agregados.</em></div><div class="grid-form" style="margin-top:15px">${limites}</div><div class="botones"><button type="button" onclick="Calculadora.calcularDefPolinomio()">Calcular integral definida</button></div>`;
    }else if(tipo === 'exponencial') zona.innerHTML = grid([campo('A en A e^(kx)','A-def','text','Ej. 2'), campo('k en A e^(kx)','kk-def','text','Ej. 3/4'), limites], 'Calculadora.calcularDefExponencial()');
    else if(tipo === 'logaritmica') zona.innerHTML = grid([campo('A en A/x','Alog-def','text','Ej. 2'), limites], 'Calculadora.calcularDefLogaritmica()');
    else if(tipo === 'trigonometrica') zona.innerHTML = `<div class="grid-form"><div class="campo"><label>Función trigonométrica</label><select id="trig-def-fun"><option value="sen">A sen(x)</option><option value="cos">A cos(x)</option><option value="tan">A tan(x)</option></select></div>${campo('Constante A','Atrig-def','text','Ej. 1, -2, 3/4')}${limites}</div><div class="botones"><button type="button" onclick="Calculadora.calcularDefTrig()">Calcular integral definida</button></div>`;
    renderMath();
}
function calcularDefConstante(){
    try{
        const k=parse('k-def','k'), a=parse('a-def','a'), b=parse('b-def','b'); const res = k.mul(b.sub(a));
        const resultado = res.toLatex();
        const extra = `${resultadoFinalHTML(resultado)}<p><b>Resultado decimal:</b> ${fmtNum(res.toNumber())}</p>`;
        mostrarPasos('resultado-def','Integral definida de una constante',[
            String.raw`\int_a^b k\,dx=k(b-a)`,
            String.raw`f(x)=${k.toLatex()},\quad a=${a.toLatex()},\quad b=${b.toLatex()}`,
            String.raw`\int_{${a.toLatex()}}^{${b.toLatex()}} ${k.toLatex()}\,dx=${k.toLatex()}\left(${b.toLatex()}-${a.toLatex()}\right)`,
            String.raw`${k.toLatex()}\left(${b.toLatex()}-${a.toLatex()}\right)=${resultado}`
        ], extra);
        
    }catch(err){ mostrarError('resultado-def',err.message); }
}

function calcularDefPotencia(){
    try{
        const n=parse('n-def','n'), a=parse('a-def','a'), b=parse('b-def','b');
        if(n.eqInt(-1)){
            if(intervaloContieneCero(a.toNumber(), b.toNumber())) throw new Error('El intervalo no puede contener x = 0 para integrar 1/x.');
            const res = Math.log(Math.abs(b.toNumber())) - Math.log(Math.abs(a.toNumber()));
            const resultado = fmtNum(res);
            const extra = `${resultadoFinalHTML(resultado)}<p><b>Resultado decimal:</b> ${resultado}</p>`;
            mostrarPasos('resultado-def','Integral definida de x^{-1}',[
                String.raw`\int \frac{1}{x}\,dx=\log|x|+C`,
                String.raw`f(x)=\frac{1}{x},\quad a=${a.toLatex()},\quad b=${b.toLatex()}`,
                String.raw`\int_{${a.toLatex()}}^{${b.toLatex()}} \frac{1}{x}\,dx=\log|${b.toLatex()}|-\log|${a.toLatex()}|`,
                String.raw`\log|${b.toLatex()}|-\log|${a.toLatex()}|=${resultado}`
            ], extra);
            
        }else{
            const F = antiderivadaTermino(uno(), n); const res = definitePoly([{c:uno(), e:n}], a.toNumber(), b.toNumber());
            const resultado = fmtNum(res);
            const extra = `${resultadoFinalHTML(resultado)}<p><b>Resultado decimal:</b> ${resultado}</p>`;
            mostrarPasos('resultado-def','Integral definida de x^n',[
                String.raw`\int x^n\,dx=\frac{x^{n+1}}{n+1}+C,\quad n\neq -1`,
                String.raw`f(x)=x^{${n.toLatex()}},\quad a=${a.toLatex()},\quad b=${b.toLatex()}`,
                String.raw`F(x)=${F}`,
                String.raw`F(${b.toLatex()})-F(${a.toLatex()})=${resultado}`
            ], extra);
            
        }
    }catch(err){ mostrarError('resultado-def',err.message); }
}

function calcularDefPolinomio(){
    try{
        if(!estados.def.length) throw new Error('Agrega al menos un término al polinomio.');
        const a=parse('a-def','a'), b=parse('b-def','b');
        if(estados.def.some(t=>t.e.eqInt(-1)) && intervaloContieneCero(a.toNumber(), b.toNumber())) throw new Error('El intervalo no puede contener x=0 si el polinomio incluye x^{-1}.');
        const P=polinomioLatex(estados.def); const F=antiderivadaPolinomio(estados.def); const res=definitePoly(estados.def,a.toNumber(),b.toNumber());
        const resultado = fmtNum(res);
        const extra = `${resultadoFinalHTML(resultado)}<p><b>Resultado decimal:</b> ${resultado}</p>`;
        mostrarPasos('resultado-def','Integral definida de un polinomio',[
            String.raw`\int P(x)\,dx=F(x)+C`,
            String.raw`P(x)=${P},\quad a=${a.toLatex()},\quad b=${b.toLatex()}`,
            String.raw`F(x)=${F}`,
            String.raw`\int_{${a.toLatex()}}^{${b.toLatex()}}P(x)\,dx=F(${b.toLatex()})-F(${a.toLatex()})`,
            String.raw`F(${b.toLatex()})-F(${a.toLatex()})=${resultado}`
        ], extra);
        
    }catch(err){ mostrarError('resultado-def',err.message); }
}

function calcularDefExponencial(){
    try{
        const A=parse('A-def','A'), k=parse('kk-def','k'), a=parse('a-def','a'), b=parse('b-def','b');
        let res, pasos;
        if(k.isZero()){
            res = A.mul(b.sub(a)).toNumber();
            pasos = [String.raw`\int_a^b A\,dx=A(b-a)`, String.raw`f(x)=${A.toLatex()},\quad a=${a.toLatex()},\quad b=${b.toLatex()}`, String.raw`e^{0x}=1`, String.raw`${A.toLatex()}(${b.toLatex()}-${a.toLatex()})=${fmtNum(res)}`];
        }else{
            res = A.div(k).toNumber() * (Math.exp(k.toNumber()*b.toNumber()) - Math.exp(k.toNumber()*a.toNumber()));
            pasos = [String.raw`\int Ae^{kx}\,dx=\frac{A}{k}e^{kx}+C`, String.raw`f(x)=${productoLatex(A,`e^{${k.toLatex()}x}`)},\quad a=${a.toLatex()},\quad b=${b.toLatex()}`, String.raw`F(x)=\frac{${A.toLatex()}}{${k.toLatex()}}e^{${k.toLatex()}x}`, String.raw`F(${b.toLatex()})-F(${a.toLatex()})=${fmtNum(res)}`];
        }
        const resultado = fmtNum(res);
        const extra = `${resultadoFinalHTML(resultado)}<p><b>Resultado decimal:</b> ${resultado}</p>`;
        mostrarPasos('resultado-def','Integral definida exponencial',pasos, extra);
        
    }catch(err){ mostrarError('resultado-def',err.message); }
}

function calcularDefLogaritmica(){
    try{
        const A=parse('Alog-def','A'), a=parse('a-def','a'), b=parse('b-def','b');
        if(intervaloContieneCero(a.toNumber(),b.toNumber())) throw new Error('El intervalo no puede contener x = 0.');
        const res = A.toNumber() * (Math.log(Math.abs(b.toNumber())) - Math.log(Math.abs(a.toNumber())));
        const resultado = fmtNum(res);
        const extra = `${resultadoFinalHTML(resultado)}<p><b>Resultado decimal:</b> ${resultado}</p>`;
        mostrarPasos('resultado-def','Integral definida logarítmica',[
            String.raw`\int \frac{A}{x}\,dx=A\log|x|+C`,
            String.raw`f(x)=\frac{${A.toLatex()}}{x},\quad a=${a.toLatex()},\quad b=${b.toLatex()}`,
            String.raw`F(x)=${productoLatex(A,String.raw`\log|x|`)}`,
            String.raw`${A.toLatex()}(\log|${b.toLatex()}|-\log|${a.toLatex()}|)=${resultado}`
        ], extra);
        
    }catch(err){ mostrarError('resultado-def',err.message); }
}

function intervaloCruzaAsintotaTan(a,b){
    const ini = Math.min(a,b), fin = Math.max(a,b);
    const kMin = Math.ceil((ini - Math.PI/2) / Math.PI);
    const kMax = Math.floor((fin - Math.PI/2) / Math.PI);
    return kMin <= kMax;
}
function calcularDefTrig(){
    try{
        const tipo = val('trig-def-fun');
        const A = parse('Atrig-def','A'), a = parse('a-def','a'), b = parse('b-def','b');
        const an = a.toNumber(), bn = b.toNumber(), coef = A.toNumber();
        let res, formula, fLatex, regla, antiderivada, fGrafica;
        if(tipo === 'sen'){
            res = coef * (Math.cos(an) - Math.cos(bn));
            fLatex = productoLatex(A, String.raw`\operatorname{sen}(x)`);
            regla = String.raw`\int \operatorname{sen}(x)\,dx=-\cos(x)+C`;
            antiderivada = productoLatex(A, String.raw`-\cos(x)`);
            formula = String.raw`\int_{${a.toLatex()}}^{${b.toLatex()}} ${fLatex}\,dx=${A.toLatex()}\left[-\cos(x)\right]_{${a.toLatex()}}^{${b.toLatex()}}`;
            fGrafica = x => coef * Math.sin(x);
        }else if(tipo === 'cos'){
            res = coef * (Math.sin(bn) - Math.sin(an));
            fLatex = productoLatex(A, String.raw`\cos(x)`);
            regla = String.raw`\int \cos(x)\,dx=\operatorname{sen}(x)+C`;
            antiderivada = productoLatex(A, String.raw`\operatorname{sen}(x)`);
            formula = String.raw`\int_{${a.toLatex()}}^{${b.toLatex()}} ${fLatex}\,dx=${A.toLatex()}\left[\operatorname{sen}(x)\right]_{${a.toLatex()}}^{${b.toLatex()}}`;
            fGrafica = x => coef * Math.cos(x);
        }else if(tipo === 'tan'){
            if(intervaloCruzaAsintotaTan(an,bn)) throw new Error('El intervalo cruza una asíntota de tan(x): x=π/2+kπ. Cambia los límites.');
            const ca = Math.cos(an), cb = Math.cos(bn);
            if(Math.abs(ca) < 1e-12 || Math.abs(cb) < 1e-12) throw new Error('Un límite cae demasiado cerca de una asíntota de tan(x).');
            res = coef * (Math.log(Math.abs(ca)) - Math.log(Math.abs(cb)));
            fLatex = productoLatex(A, String.raw`\tan(x)`);
            regla = String.raw`\int \tan(x)\,dx=-\log|\cos(x)|+C`;
            antiderivada = productoLatex(A, String.raw`-\log|\cos(x)|`);
            formula = String.raw`\int_{${a.toLatex()}}^{${b.toLatex()}} ${fLatex}\,dx=${A.toLatex()}\left[-\log|\cos(x)|\right]_{${a.toLatex()}}^{${b.toLatex()}}`;
            fGrafica = x => coef * Math.tan(x);
        }else{
            throw new Error('Selecciona una función trigonométrica válida.');
        }
        const resultado = fmtNum(res);
        const extra = `${resultadoFinalHTML(resultado)}<p><b>Resultado decimal:</b> ${resultado}</p>`;
        mostrarPasos('resultado-def','Integral definida trigonométrica',[
            regla,
            String.raw`f(x)=${fLatex},\quad a=${a.toLatex()},\quad b=${b.toLatex()}`,
            String.raw`F(x)=${antiderivada}`,
            formula,
            String.raw`\text{Resultado decimal: } ${resultado}`
        ], extra);
        
    }catch(err){ mostrarError('resultado-def',err.message); }
}

function renderFuncionSelector(prefix, estadoKey){
    const tipo = val(`${prefix}-tipo`);
    const zona = $(`${prefix}-params`); if(!zona) return;
    const variable = prefix === 'cin' ? 't' : 'x';
    if(tipo === 'constante') zona.innerHTML = campo('Constante k',`${prefix}-k`,'text','Ej. 2, -1.5, 3/4');
    else if(tipo === 'potencia') zona.innerHTML = campo(`Exponente n en ${variable}^n`,`${prefix}-n`,'text','Ej. 2, -1/2');
    else if(tipo === 'exponencial') zona.innerHTML = campo('A',`${prefix}-A`,'text','Ej. 2') + campo(`k en A e^(k${variable})`,`${prefix}-ek`,'text','Ej. 1');
    else if(tipo === 'sen' || tipo === 'cos') zona.innerHTML = `<p class="ayuda">No necesita parámetros. Se usa ${tipo}(${variable}).</p>`;
    else if(tipo === 'polinomio'){
        estados[estadoKey] = [];
        zona.innerHTML = `<div class="grid-form">${campo('Coeficiente',`${prefix}-coef`,'text','Ej. 3/4')}${campo('Exponente',`${prefix}-exp`,'text','Ej. 2')}</div><div class="botones"><button type="button" onclick="Calculadora.addTerm('${prefix}-lista','${estadoKey}','${prefix}-coef','${prefix}-exp','${variable}')">Agregar término</button><button type="button" class="secundario" onclick="Calculadora.clearTerms('${prefix}-lista','${estadoKey}')">Borrar</button></div><div id="${prefix}-lista" class="lista-terminos"><em>Aún no hay términos agregados.</em></div>`;
    }
    renderMath();
}
function obtenerFuncion(prefix, estadoKey){
    const tipo = val(`${prefix}-tipo`);
    if(tipo === 'constante'){
        const k=parse(`${prefix}-k`,'k'); return {f:()=>k.toNumber(), latex:k.toLatex()};
    } if(tipo === 'potencia'){
        const n=parse(`${prefix}-n`,'n'); return {f:x=>Math.pow(x,n.toNumber()), latex:`x^{${n.toLatex()}}`};
    } if(tipo === 'exponencial'){
        const A=parse(`${prefix}-A`,'A'), k=parse(`${prefix}-ek`,'k'); return {f:x=>A.toNumber()*Math.exp(k.toNumber()*x), latex:productoLatex(A,`e^{${k.toLatex()}x}`)};
    } if(tipo === 'sen') return {f:Math.sin, latex:'\\operatorname{sen}(x)'};
    if(tipo === 'cos') return {f:Math.cos, latex:'\\cos(x)'};
    if(tipo === 'polinomio'){
        if(!estados[estadoKey].length) throw new Error('Agrega al menos un término al polinomio de la función.');
        return {f:x=>valorPolinomio(estados[estadoKey],x), latex:polinomioLatex(estados[estadoKey])};
    }
    throw new Error('Función no válida.');
}

function obtenerFuncionLibre(inputId, nombre='función'){
    const expresion = val(inputId).trim();
    if(!expresion) throw new Error(`Escribe la ${nombre}.`);
    return {
        f: compilarFuncionAnalitica(expresion, 'x'),
        latex: latexUsuarioBasico(expresion),
        expresion
    };
}
function evaluarFuncionSeguro(f,x){
    try{
        const y = Number(f(x));
        return Number.isFinite(y) ? y : NaN;
    }catch(_){ return NaN; }
}
function diagnosticarImpropriedadFuncion(f,a,b,opciones={}){
    const razones=[];
    const eps = Math.max(Math.abs(b-a)*1e-6, 1e-7);
    const limiteGrande = opciones.limiteGrande || 1e6;
    if(!Number.isFinite(a) || !Number.isFinite(b)){
        razones.push('Integral impropia de primera especie: al menos un límite de integración es infinito.');
    }
    if(Number.isFinite(a)){
        const ya = evaluarFuncionSeguro(f,a);
        const ya2 = evaluarFuncionSeguro(f,a + eps);
        if(!Number.isFinite(ya) || !Number.isFinite(ya2) || Math.abs(ya) > limiteGrande || Math.abs(ya2) > limiteGrande){
            razones.push('Integral impropia de segunda especie: la función no es finita o tiende a infinito en el extremo inferior.');
        }
    }
    if(Number.isFinite(b)){
        const yb = evaluarFuncionSeguro(f,b);
        const yb2 = evaluarFuncionSeguro(f,b - eps);
        if(!Number.isFinite(yb) || !Number.isFinite(yb2) || Math.abs(yb) > limiteGrande || Math.abs(yb2) > limiteGrande){
            razones.push('Integral impropia de segunda especie: la función no es finita o tiende a infinito en el extremo superior.');
        }
    }
    const muestras = opciones.muestras || 500;
    let internas=0;
    if(Number.isFinite(a) && Number.isFinite(b)){
        for(let i=1;i<muestras;i++){
            const x = a + (b-a)*i/muestras;
            const y = evaluarFuncionSeguro(f,x);
            if(!Number.isFinite(y) || Math.abs(y) > limiteGrande){ internas++; }
        }
        if(internas > 0){
            razones.push(`Discontinuidad o indeterminación interna detectada: existen puntos dentro del intervalo donde f(x) no es finita o crece demasiado.`);
        }
    }
    return {impropia: razones.length > 0, razones};
}
function textoDiagnosticoImpropria(diagnostico){
    if(!diagnostico || !diagnostico.impropia) return '';
    return `<div class="advertencia-calculo"><b>Integral impropia o problemática detectada.</b><br>${diagnostico.razones.map(escapeHtml).join('<br>')}<br>La gráfica se muestra como <b>posible vista</b>; si el valor numérico no es confiable, se reporta como <b>Sin resultado numérico</b>.</div>`;
}
function valorNumericoOMensaje(v){
    return Number.isFinite(v) ? fmtCinematicaResultado(v) : 'Sin resultado numérico';
}

function trapecio(f,a,b,n=1000,absVal=false){
    if(!Number.isFinite(a) || !Number.isFinite(b)) throw new Error('Los límites deben ser números finitos.');
    if(!Number.isInteger(n) || n <= 0) throw new Error('n debe ser un entero positivo.');
    const evaluar = (x) => {
        const y = f(x);
        if(!Number.isFinite(y)) throw new Error(`La función no se pudo evaluar correctamente en x=${fmtNum(x)}.`);
        return absVal ? Math.abs(y) : y;
    };
    const h=(b-a)/n;
    let suma=0.5*(evaluar(a)+evaluar(b));
    for(let i=1;i<n;i++){ const x=a+i*h; suma += evaluar(x); }
    return suma*h;
}

function crearBloqueGrafica(id,titulo='Gráfica',descripcion=''){
    const texto = descripcion ? `<p class="explicacion-cinematica">${escapeHtml(descripcion)}</p>` : '';
    return `<div class="grafica-panel"><h4>${escapeHtml(titulo)}</h4><div class="chart-wrap"><canvas id="${escapeHtml(id)}" aria-label="${escapeHtml(titulo)}"></canvas></div>${texto}</div>`;
}

function crearBloquesGraficasCinematica(bloques){
    return `<div class="cinematica-graficas">${bloques.map(b=>crearBloqueGrafica(b.id,b.titulo,b.descripcion || '')).join('')}</div>`;
}
function muestrasCinematica(f,a,b,n=0){
    if(!Number.isFinite(a) || !Number.isFinite(b)) throw new Error('Los tiempos deben ser números finitos.');
    if(b <= a) throw new Error('El tiempo final debe ser mayor que el tiempo inicial.');
    const duracion = b - a;
    const muestrasBase = n && Number.isFinite(n) ? Math.floor(n) : Math.ceil(Math.max(960, Math.min(1800, duracion * 160)));
    const total = Math.max(600, muestrasBase);
    const xs=[], ys=[];
    for(let i=0;i<=total;i++){
        const t=a+(b-a)*i/total;
        const y=f(t);
        if(!Number.isFinite(y)) throw new Error(`La función no se pudo evaluar correctamente en t=${fmtNum(t)}.`);
        xs.push(t); ys.push(y);
    }
    return {xs, ys};
}
function integrarAcumuladaCinematica(xs, ys, inicial=0){
    const out=[inicial];
    for(let i=1;i<xs.length;i++){
        const h=xs[i]-xs[i-1];
        out.push(out[i-1]+0.5*(ys[i-1]+ys[i])*h);
    }
    return out;
}
function puntosCinematica(xs, ys){
    return xs.map((x,i)=>({x, y:ys[i]}));
}
function constanteCinematica(xs, y){
    return xs.map(x=>({x, y}));
}
function datosSerieCinematica(xs, ys, nombre){
    return {nombre, puntos:puntosCinematica(xs,ys)};
}
function rangoConMargen(min,max,padRatio=0.12){
    if(!Number.isFinite(min) || !Number.isFinite(max)){ return [-1,1]; }
    if(min === max){
        const pad=Math.max(1, Math.abs(min)*0.35);
        return [min-pad, max+pad];
    }
    const pad=(max-min)*padRatio;
    return [min-pad, max+pad];
}
function incluirCeroSiConviene(min,max,forzar=false){
    if(!Number.isFinite(min) || !Number.isFinite(max)) return [min,max];
    if(min <= 0 && max >= 0) return [Math.min(min,0), Math.max(max,0)];
    const span = Math.max(Math.abs(max-min), 1e-9);
    const distancia = min > 0 ? min : -max;
    if(forzar || distancia <= span * 2.5){
        return [Math.min(min,0), Math.max(max,0)];
    }
    return [min,max];
}
function numeroBonitoGrafica(valor,redondear=true){
    const v=Math.abs(Number(valor));
    if(!Number.isFinite(v) || v === 0) return 1;
    const exp=Math.floor(Math.log10(v));
    const fraccion=v/Math.pow(10,exp);
    let bonito;
    if(redondear){
        if(fraccion < 1.5) bonito=1;
        else if(fraccion < 3) bonito=2;
        else if(fraccion < 7) bonito=5;
        else bonito=10;
    }else{
        if(fraccion <= 1) bonito=1;
        else if(fraccion <= 2) bonito=2;
        else if(fraccion <= 5) bonito=5;
        else bonito=10;
    }
    return bonito*Math.pow(10,exp);
}
function clampGrafica(valor,min,max){
    return Math.max(min, Math.min(max, valor));
}
function decimalesParaPaso(paso){
    const p=Math.abs(Number(paso));
    if(!Number.isFinite(p) || p === 0) return 2;
    if(p >= 100) return 0;
    if(p >= 10) return 1;
    if(p >= 1) return 2;
    if(p >= 0.1) return 3;
    if(p >= 0.01) return 4;
    return 5;
}
function formatoNumeroGrafica(valor,paso=NaN){
    const v=Number(valor);
    if(!Number.isFinite(v)) return String(valor);
    if(Math.abs(v) < 1e-10) return '0';
    const av=Math.abs(v);
    if(av >= 1e7 || av < 1e-5) return v.toExponential(2).replace('e+','e');
    const dec=decimalesParaPaso(paso);
    let txt=v.toFixed(dec).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1');
    if(txt === '-0') txt='0';
    return txt;
}
function fmtCinematicaResultado(valor){
    const v=Number(valor);
    if(!Number.isFinite(v)) return String(valor);
    if(Math.abs(v) < 1e-10) return '0';
    if(Math.abs(v) >= 1e8 || Math.abs(v) < 1e-5) return v.toExponential(4).replace('e+','e');
    return v.toFixed(6).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1');
}
function marcasLinealesGrafica(min,max,cantidad=5){
    if(!Number.isFinite(min) || !Number.isFinite(max)) return [0];
    if(min === max) return [min || 0];
    const n=Math.max(2, Math.min(7, Math.floor(cantidad)));
    const rango=numeroBonitoGrafica(max-min,false);
    const paso=numeroBonitoGrafica(rango/(n-1),true);
    const inicio=Math.ceil(min/paso)*paso;
    const fin=Math.floor(max/paso)*paso;
    const ticks=[];
    for(let v=inicio, guard=0; v<=fin + paso*0.5 && guard<30; v+=paso, guard++){
        const limpio = Math.abs(v) < paso*1e-8 ? 0 : Number(v.toPrecision(14));
        if(limpio >= min - paso*0.05 && limpio <= max + paso*0.05) ticks.push(limpio);
    }
    if(ticks.length < 2){
        for(let i=0;i<n;i++) ticks.push(min+(max-min)*i/(n-1));
    }
    return ticks;
}
function dibujarLineaPunteada(ctx,x1,y1,x2,y2,color='#334155'){
    ctx.save();
    ctx.setLineDash([7,6]);
    ctx.strokeStyle=color;
    ctx.lineWidth=1.4;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
    ctx.restore();
}
function dibujarEtiquetaConFondo(ctx,texto,x,y,opciones={}){
    const padX=7, padY=4;
    ctx.save();
    ctx.font=opciones.font || 'bold 12px Arial';
    const ancho=ctx.measureText(texto).width + padX*2;
    const alto=20;
    const px=clampGrafica(x-ancho/2, opciones.minX ?? 0, (opciones.maxX ?? 9999)-ancho);
    const py=clampGrafica(y, opciones.minY ?? 0, (opciones.maxY ?? 9999)-alto);
    ctx.fillStyle=opciones.fondo || 'rgba(255,255,255,.92)';
    ctx.strokeStyle=opciones.borde || '#c4b5fd';
    ctx.lineWidth=1;
    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(px,py,ancho,alto,6);
    else ctx.rect(px,py,ancho,alto);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle=opciones.color || '#4c1d95';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText(texto, px+ancho/2, py+alto/2+1);
    ctx.restore();
}
function dibujarGraficaCinematica(id,titulo,series,xLabel='t',yLabel='valor',opciones={}){
    const canvas=$(id);
    if(!canvas || !series || !series.length) return;
    const cont=canvas.parentElement;
    const dpr=window.devicePixelRatio || 1;
    const cssW=Math.max(420, Math.floor((cont && cont.clientWidth) ? cont.clientWidth : 780));
    const cssH=Math.max(410, opciones.alto || 440);
    canvas.width=Math.floor(cssW*dpr);
    canvas.height=Math.floor(cssH*dpr);
    canvas.style.width=cssW+'px';
    canvas.style.height=cssH+'px';
    const ctx=canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,cssW,cssH);
    ctx.fillStyle='#ffffff';
    ctx.fillRect(0,0,cssW,cssH);

    const todos=series.flatMap(s=>s.puntos || []).filter(p=>Number.isFinite(p.x) && Number.isFinite(p.y));
    if(!todos.length) return;
    let xMin=Math.min(...todos.map(p=>p.x)), xMax=Math.max(...todos.map(p=>p.x));
    let yMin=Math.min(...todos.map(p=>p.y)), yMax=Math.max(...todos.map(p=>p.y));

    if(Number.isFinite(opciones.xInicio)){ xMin=Math.min(xMin,opciones.xInicio); xMax=Math.max(xMax,opciones.xInicio); }
    if(Number.isFinite(opciones.xFin)){ xMin=Math.min(xMin,opciones.xFin); xMax=Math.max(xMax,opciones.xFin); }
    if(opciones.incluirCeroX){ [xMin,xMax]=incluirCeroSiConviene(xMin,xMax,false); }
    if(opciones.incluirCeroY !== false){ yMin=Math.min(yMin,0); yMax=Math.max(yMax,0); }
    [xMin,xMax]=rangoConMargen(xMin,xMax,0.10);
    [yMin,yMax]=rangoConMargen(yMin,yMax,0.20);

    const ticksXPrevios=marcasLinealesGrafica(xMin,xMax,cssW < 560 ? 4 : 5);
    const ticksYPrevios=marcasLinealesGrafica(yMin,yMax,cssW < 560 ? 4 : 5);
    const pasoYPrevio=(yMax-yMin)/Math.max(1,ticksYPrevios.length-1);
    ctx.font='12px Arial';
    const anchoYMax=Math.max(...ticksYPrevios.map(v=>ctx.measureText(formatoNumeroGrafica(v,pasoYPrevio)).width), 24);
    const m={l:Math.max(92, Math.ceil(anchoYMax)+34),r:48,t:92,b:142};
    const w=cssW-m.l-m.r, h=cssH-m.t-m.b;
    const X=x=>m.l+((x-xMin)/(xMax-xMin))*w;
    const Y=y=>m.t+h-((y-yMin)/(yMax-yMin))*h;
    const dentroX=x=>x>=xMin && x<=xMax;
    const dentroY=y=>y>=yMin && y<=yMax;

    ctx.save();
    ctx.rect(m.l,m.t,w,h);
    ctx.clip();
    ctx.fillStyle='#f8fafc';
    ctx.fillRect(m.l,m.t,w,h);
    ctx.restore();

    const xTicks=ticksXPrevios;
    const yTicks=ticksYPrevios;
    const pasoX=(xMax-xMin)/Math.max(1,xTicks.length-1);
    const pasoY=(yMax-yMin)/Math.max(1,yTicks.length-1);

    ctx.font='12px Arial';
    ctx.lineWidth=1;
    ctx.strokeStyle='#e2e8f0';
    ctx.fillStyle='#475569';
    ctx.textAlign='center';
    ctx.textBaseline='top';
    let ultimoXLabel=-Infinity;
    xTicks.forEach(tx=>{
        const gx=X(tx);
        ctx.beginPath(); ctx.moveTo(gx,m.t); ctx.lineTo(gx,m.t+h); ctx.stroke();
        const label=formatoNumeroGrafica(tx,pasoX);
        const ancho=ctx.measureText(label).width;
        if(gx-ancho/2 > ultimoXLabel + 18){
            ctx.fillText(label, gx, m.t+h+22);
            ultimoXLabel=gx+ancho/2;
        }
    });
    ctx.textAlign='right';
    ctx.textBaseline='middle';
    yTicks.forEach(ty=>{
        const gy=Y(ty);
        ctx.beginPath(); ctx.moveTo(m.l,gy); ctx.lineTo(m.l+w,gy); ctx.stroke();
        const label=formatoNumeroGrafica(ty,pasoY);
        ctx.fillText(label, m.l-10, gy);
    });

    const ejeXVisible=dentroY(0);
    const ejeYVisible=dentroX(0);
    if(ejeYVisible){
        ctx.strokeStyle='#475569';
        ctx.lineWidth=1.8;
        ctx.beginPath(); ctx.moveTo(X(0),m.t); ctx.lineTo(X(0),m.t+h); ctx.stroke();
    }
    if(ejeXVisible){
        ctx.strokeStyle='#475569';
        ctx.lineWidth=1.8;
        ctx.beginPath(); ctx.moveTo(m.l,Y(0)); ctx.lineTo(m.l+w,Y(0)); ctx.stroke();
    }
    if(ejeXVisible && ejeYVisible){
        ctx.fillStyle='#111827';
        ctx.beginPath(); ctx.arc(X(0),Y(0),4,0,Math.PI*2); ctx.fill();
    }

    const etiquetaLimite=(valor,etiqueta,row=0)=>{
        if(!Number.isFinite(valor) || !dentroX(valor)) return;
        const px=X(valor);
        dibujarLineaPunteada(ctx,px,m.t,px,m.t+h,'#7c3aed');
        const texto=`${etiqueta} = ${formatoNumeroGrafica(valor,pasoX)}`;
        // La etiqueta se dibuja fuera de la cuadrícula para no tapar la gráfica.
        dibujarEtiquetaConFondo(ctx,texto,px,m.t-62+row*24,{minX:m.l,maxX:m.l+w,minY:10,maxY:m.t-10,color:'#4c1d95',borde:'#a78bfa'});
    };
    etiquetaLimite(opciones.xInicio, opciones.etiquetaInicio || 't₁', 0);
    etiquetaLimite(opciones.xFin, opciones.etiquetaFin || 't₂', 1);

    const colores=['#2563eb','#dc2626','#16a34a','#9333ea','#ea580c','#0891b2'];
    const serieArea = series.find(s=>s.area) || (opciones.area ? series[0] : null);
    if(serieArea && ejeXVisible){
        const pts=(serieArea.puntos || []).filter(p=>Number.isFinite(p.x) && Number.isFinite(p.y));
        if(pts.length > 1){
            ctx.save();
            ctx.rect(m.l,m.t,w,h);
            ctx.clip();
            ctx.beginPath();
            pts.forEach((p,i)=>{ const px=X(p.x), py=Y(p.y); if(i===0){ ctx.moveTo(px,Y(0)); ctx.lineTo(px,py); } else ctx.lineTo(px,py); });
            const ultimo=pts[pts.length-1];
            ctx.lineTo(X(ultimo.x),Y(0));
            ctx.closePath();
            ctx.fillStyle=serieArea.areaColor || 'rgba(37,99,235,0.20)';
            ctx.fill();
            ctx.restore();
        }
    }

    ctx.save();
    ctx.rect(m.l,m.t,w,h);
    ctx.clip();
    series.forEach((serie,idx)=>{
        const pts=(serie.puntos || []).filter(p=>Number.isFinite(p.x) && Number.isFinite(p.y));
        if(!pts.length) return;
        ctx.beginPath();
        pts.forEach((p,i)=>{ const px=X(p.x), py=Y(p.y); if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py); });
        ctx.strokeStyle=serie.color || colores[idx % colores.length];
        ctx.lineWidth=serie.dashed ? 2.2 : 2.9;
        if(serie.dashed) ctx.setLineDash([9,7]); else ctx.setLineDash([]);
        ctx.stroke();
        ctx.setLineDash([]);
    });
    ctx.restore();

    ctx.strokeStyle='#111827';
    ctx.lineWidth=1.3;
    ctx.strokeRect(m.l,m.t,w,h);

    let lx=m.l+12, ly=m.t+h+62;
    ctx.save();
    ctx.font='bold 12px Arial';
    const leyendaAncho=Math.min(300, w-24);
    const leyendaAlto=18*series.length + (serieArea ? 18 : 4) + 8;
    ctx.fillStyle='rgba(255,255,255,.94)';
    ctx.strokeStyle='#dbe3ef';
    ctx.lineWidth=1;
    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(lx-8,ly-18,leyendaAncho,leyendaAlto,8);
    else ctx.rect(lx-8,ly-18,leyendaAncho,leyendaAlto);
    ctx.fill(); ctx.stroke();
    series.forEach((serie,idx)=>{
        ctx.strokeStyle=serie.color || colores[idx % colores.length];
        ctx.lineWidth=3;
        if(serie.dashed) ctx.setLineDash([8,6]); else ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(lx,ly-8); ctx.lineTo(lx+20,ly-8); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle='#111827';
        ctx.textAlign='left'; ctx.textBaseline='alphabetic';
        ctx.fillText(serie.nombre || `Serie ${idx+1}`, lx+28, ly-4);
        ly+=18;
    });
    if(serieArea){
        ctx.fillStyle='rgba(37,99,235,0.20)';
        ctx.fillRect(lx,ly-14,20,10);
        ctx.fillStyle='#111827';
        ctx.fillText(opciones.textoArea || 'área acumulada', lx+28, ly-5);
    }
    ctx.restore();

    ctx.font='bold 13px Arial';
    ctx.fillStyle='#0f172a';
    ctx.textAlign='center';
    ctx.textBaseline='alphabetic';
    ctx.fillText(xLabel, m.l+w/2, cssH-22);
    ctx.save();
    ctx.translate(24, m.t+h/2);
    ctx.rotate(-Math.PI/2);
    ctx.textAlign='center';
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
}
function bloqueDetalleCinematica(titulo,filas){
    const cuerpo=(filas || []).map(([campo,valor])=>`<tr><th>${escapeHtml(campo)}</th><td>${escapeHtml(valor)}</td></tr>`).join('');
    return `<div class="resumen-cinematica"><h4>${escapeHtml(titulo)}</h4><table><tbody>${cuerpo}</tbody></table></div>`;
}
function pasosCinematica(lineas){
    return lineas.map((p,i)=>({
        titulo: p.titulo || (i===0 ? 'Regla aplicada' : `Paso ${i}`),
        latex: p.latex || '',
        explicacion: p.explicacion || '',
        tipo: p.tipo || 'calculo'
    }));
}
function calcularArea(){
    try{
        const F=obtenerFuncionLibre('area-f','función f(x)');
        const G=obtenerFuncionLibre('area-g','función g(x)');
        const a=parse('area-a','a'), b=parse('area-b','b');
        const n=parseEnteroLimitado('area-n','n trapecios','1000');
        if(n <= 0) throw new Error('n debe ser mayor que 0.');
        const an=a.toNumber(), bn=b.toNumber();
        if(bn <= an) throw new Error('El límite superior debe ser mayor que el límite inferior.');
        const diagF = diagnosticarImpropriedadFuncion(F.f,an,bn);
        const diagG = diagnosticarImpropriedadFuncion(G.f,an,bn);
        const diag = {impropia: diagF.impropia || diagG.impropia, razones:[...diagF.razones.map(r=>'f(x): '+r), ...diagG.razones.map(r=>'g(x): '+r)]};
        let res=NaN;
        try{ res=trapecio(x=>Math.abs(F.f(x)-G.f(x)), an, bn, n, false); }catch(_){ res=NaN; }
        const resultado = valorNumericoOMensaje(res);
        const resultadoLatex = Number.isFinite(res) ? resultado : String.raw`\text{Sin resultado numérico}`;
        const extra = `${textoDiagnosticoImpropria(diag)}${bloqueAdvertencia(advertenciaAproximacion(n))}${resultadoFinalHTML(resultado)}<p><b>Resultado aproximado:</b> ${resultado}</p>`;
        mostrarPasos('resultado-area','Área entre curvas',[
            String.raw`A=\int_a^b |f(x)-g(x)|\,dx`,
            String.raw`f(x)=${F.latex},\quad g(x)=${G.latex}`,
            String.raw`a=${a.toLatex()},\quad b=${b.toLatex()},\quad n=${n}`,
            String.raw`A\approx ${resultadoLatex}`
        ], extra);
        dibujarGraficaAreaCurvas(F,G,an,bn,diag);
    }catch(err){ mostrarError('resultado-area',err.message); }
}

function dibujarGraficaAreaCurvas(F,G,a,b,diagnostico={}){
    const panel=document.querySelector('.grafica-area-curvas');
    const canvas=$('area-canvas');
    if(!panel || !canvas) return;
    panel.style.display='block';
    const cont=canvas.parentElement;
    const dpr=Math.max(2,window.devicePixelRatio||1);
    const cssW=Math.max(760,Math.floor((cont&&cont.clientWidth)?cont.clientWidth:1000));
    const cssH=560;
    canvas.width=Math.floor(cssW*dpr); canvas.height=Math.floor(cssH*dpr);
    canvas.style.width=cssW+'px'; canvas.style.height=cssH+'px';
    const ctx=canvas.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,cssW,cssH); ctx.fillStyle='#fff'; ctx.fillRect(0,0,cssW,cssH);
    const span=b-a, xMin=a-span*0.12, xMax=b+span*0.12;
    const ptsF=[], ptsG=[], valores=[];
    for(let i=0;i<=1000;i++){
        const x=xMin+(xMax-xMin)*i/1000;
        const yf=evaluarFuncionSeguro(F.f,x), yg=evaluarFuncionSeguro(G.f,x);
        ptsF.push({x,y:yf}); ptsG.push({x,y:yg});
        if(Number.isFinite(yf)) valores.push(yf);
        if(Number.isFinite(yg)) valores.push(yg);
    }
    let [yMin,yMax]=rangoRobustoGrafica(valores);
    const m={l:76,r:28,t:30,b:68}, w=cssW-m.l-m.r, h=cssH-m.t-m.b;
    const X=x=>m.l+((x-xMin)/(xMax-xMin))*w;
    const Y=y=>m.t+h-((y-yMin)/(yMax-yMin))*h;
    ctx.fillStyle='#fbfdff'; ctx.fillRect(m.l,m.t,w,h);
    dibujarCuadriculaEnteros(ctx,{xMin,xMax,yMin,yMax,m,w,h,X,Y});
    ctx.save(); ctx.rect(m.l,m.t,w,h); ctx.clip();
    ctx.beginPath();
    ptsF.forEach((p,i)=>{ if(!Number.isFinite(p.y)) return; const px=X(p.x),py=Y(p.y); if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py); });
    for(let i=ptsG.length-1;i>=0;i--){ const p=ptsG[i]; if(!Number.isFinite(p.y)) continue; ctx.lineTo(X(p.x),Y(p.y)); }
    ctx.closePath(); ctx.fillStyle='rgba(37,99,235,0.13)'; ctx.fill();
    dibujarLineaSerieEsbozo(ctx,ptsF,X,Y,'#2563eb',3.2,yMin,yMax);
    dibujarLineaSerieEsbozo(ctx,ptsG,X,Y,'#dc2626',3.2,yMin,yMax);
    ctx.restore();
    ctx.strokeStyle='#111827'; ctx.lineWidth=1.6; ctx.strokeRect(m.l,m.t,w,h);
    ctx.fillStyle='#334155'; ctx.font='13px Arial'; ctx.textAlign='center'; ctx.fillText('x',m.l+w/2,cssH-22);
    ctx.save(); ctx.translate(22,m.t+h/2); ctx.rotate(-Math.PI/2); ctx.fillText('y',0,0); ctx.restore();
    const titulo=panel.querySelector('h4'); if(titulo) titulo.textContent = diagnostico.impropia ? 'Área entre curvas: posible vista' : 'Área entre curvas';
}

function dibujarCuadriculaEnteros(ctx,info){
    const {xMin,xMax,yMin,yMax,m,w,h,X,Y}=info;
    ctx.save(); ctx.rect(m.l,m.t,w,h); ctx.clip();
    ctx.strokeStyle='#e2e8f0'; ctx.lineWidth=1;
    const ticksX=marcasLinealesGrafica(xMin,xMax,7), ticksY=marcasLinealesGrafica(yMin,yMax,6);
    ticksX.forEach(tx=>{ const gx=X(tx); ctx.beginPath(); ctx.moveTo(gx,m.t); ctx.lineTo(gx,m.t+h); ctx.stroke(); });
    ticksY.forEach(ty=>{ const gy=Y(ty); ctx.beginPath(); ctx.moveTo(m.l,gy); ctx.lineTo(m.l+w,gy); ctx.stroke(); });
    if(xMax-xMin <= 60){
        ctx.strokeStyle='#d1d9e6'; ctx.lineWidth=1.15;
        for(let k=Math.ceil(xMin); k<=Math.floor(xMax); k++){
            const gx=X(k); ctx.beginPath(); ctx.moveTo(gx,m.t); ctx.lineTo(gx,m.t+h); ctx.stroke();
        }
    }
    if(yMax-yMin <= 60){
        ctx.strokeStyle='#d1d9e6'; ctx.lineWidth=1.15;
        for(let k=Math.ceil(yMin); k<=Math.floor(yMax); k++){
            const gy=Y(k); ctx.beginPath(); ctx.moveTo(m.l,gy); ctx.lineTo(m.l+w,gy); ctx.stroke();
        }
    }
    if(xMin<=0 && xMax>=0){ ctx.strokeStyle='#0f172a'; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(X(0),m.t); ctx.lineTo(X(0),m.t+h); ctx.stroke(); }
    if(yMin<=0 && yMax>=0){ ctx.strokeStyle='#0f172a'; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(m.l,Y(0)); ctx.lineTo(m.l+w,Y(0)); ctx.stroke(); }
    ctx.restore();
}

function formulaSeleccionRiemann(metodo){
    if(metodo === 'izquierda') return String.raw`A=\{t_0,t_1,\dots,t_{n-1}\}`;
    if(metodo === 'derecha') return String.raw`A=\{t_1,t_2,\dots,t_n\}`;
    if(metodo === 'media') return String.raw`A=\left\{\frac{t_0+t_1}{2},\frac{t_1+t_2}{2},\dots,\frac{t_{n-1}+t_n}{2}\right\}`;
    return String.raw`A=\{s_1,s_2,\dots,s_n\}`;
}
function calcularRiemann(){
    try{
        const F=obtenerFuncionLibre('rie-f','función f(x)');
        validarCampoDigitos('rie-p','partición');
        validarCampoDigitos('rie-xi','selección manual');
        let P=parseListaFracciones(val('rie-p'),'partición');
        validarParticion(P);
        const aNum=P[0].toNumber(), bNum=P[P.length-1].toNumber();
        const diag=diagnosticarImpropriedadFuncion(F.f,aNum,bNum);
        const refinar=val('rie-refinar') === 'si';
        const factor=parseEnteroLimitado('rie-factor','factor de refinamiento','2');
        if(refinar){ if(factor < 2) throw new Error('El factor de refinamiento debe ser al menos 2.'); P=refinarParticion(P,factor); }
        const metodo=val('rie-metodo'); const n=P.length-1; let xis=[];
        if(metodo === 'manual'){
            xis=parseListaFracciones(val('rie-xi'),'selección');
            if(xis.length !== n) throw new Error(`La selección debe tener exactamente ${n} valores, uno por cada subintervalo.`);
            for(let i=1;i<P.length;i++){
                const x=xis[i-1].toNumber(), a=P[i-1].toNumber(), b=P[i].toNumber();
                if(x<a || x>b) throw new Error(`s_${i} debe pertenecer al subintervalo [${P[i-1].toPlain()}, ${P[i].toPlain()}].`);
            }
        }else{
            for(let i=1;i<P.length;i++){
                if(metodo === 'izquierda') xis.push(P[i-1]);
                else if(metodo === 'derecha') xis.push(P[i]);
                else xis.push(P[i-1].add(P[i]).div(new Frac(2n,1n)));
            }
        }
        const tabla=tablaRiemann(F.f,P,xis); const resultado=Number.isFinite(tabla.suma)?fmtNum(tabla.suma):'Sin resultado numérico'; const resultadoLatex=Number.isFinite(tabla.suma)?resultado:String.raw`\text{Sin resultado numérico}`;
        const aInt=P[0].toLatex(), bInt=P[P.length-1].toLatex();
        const seleccionTxt=descripcionSeleccionRiemann(metodo);
        const expansion=expresionRiemannLatex(P,xis);
        const deltaUniforme = P.every((x,i)=> i===0 || Math.abs(x.sub(P[i-1]).toNumber()-P[1].sub(P[0]).toNumber()) < 1e-12);
        const dxLatex = deltaUniforme ? String.raw`\Delta x=\frac{b-a}{n}=\frac{${bInt}-${aInt}}{${n}}=${P[1].sub(P[0]).toLatex()}` : String.raw`\Delta x_i=t_i-t_{i-1}`;
        const extra=`${textoDiagnosticoImpropria(diag)}${bloqueAdvertencia(`Este resultado es aproximado. Se usó una suma de Riemann con ${seleccionTxt} y la partición indicada.`)}${tabla.html}${resultadoFinalHTML(String.raw`S(f,P,A)\approx ${resultadoLatex}`)}<p><b>Suma final:</b> ${resultado}</p>`;
        mostrarPasos('resultado-riemann','Suma de Riemann',[
            {titulo:'Regla aplicada', latex:String.raw`S(f,P,A)=\sum_{i=1}^{n} f(s_i)(t_i-t_{i-1})`, explicacion:'La suma de Riemann aproxima el área bajo la curva usando rectángulos.'},
            {latex:String.raw`f:[${aInt},${bInt}]\to\mathbb{R},\quad f(x)=${F.latex}`, explicacion:'Función ingresada directamente por el usuario.'},
            {latex:String.raw`[a,b]=[${aInt},${bInt}],\quad n=${n}`, explicacion:'El intervalo se divide en n subintervalos.'},
            {latex:dxLatex, explicacion:'La base de cada rectángulo es la longitud del subintervalo.'},
            {latex:String.raw`${conjuntoLatex('P',P)}`, explicacion:'La partición P contiene los extremos de todos los subintervalos.'},
            {latex:String.raw`\text{Selección usada: ${seleccionTxt}}`, explicacion:'La selección A indica qué punto se evalúa dentro de cada subintervalo.'},
            {latex:formulaSeleccionRiemann(metodo), explicacion:'Forma general de la selección.'},
            {latex:String.raw`${conjuntoLatex('A',xis)},\quad s_i\in[t_{i-1},t_i]`, explicacion:'Puntos específicos evaluados.'},
            {latex:String.raw`S(f,P,A)=${expansion}`, explicacion:'Sustitución de valores.'},
            {latex:String.raw`S(f,P,A)\approx ${resultadoLatex}`, explicacion:'Valor aproximado de la suma de Riemann.'}
        ], extra);
    }catch(err){ mostrarError('resultado-riemann',err.message); }
}

function calcularDarboux(){
    try{
        const F=obtenerFuncionLibre('dar-f','función f(x)');
        validarCampoDigitos('dar-p','partición');
        const P=parseListaFracciones(val('dar-p'),'partición'); validarParticion(P);
        const aNum=P[0].toNumber(), bNum=P[P.length-1].toNumber();
        const diag=diagnosticarImpropriedadFuncion(F.f,aNum,bNum);
        const tipoSuma=val('dar-tipo-suma'); const m=parseEnteroLimitado('dar-m','muestras','100');
        if(m < 10) throw new Error('Usa al menos 10 muestras para aproximar ínfimos y supremos.');
        const tabla=tablaDarboux(F.f,P,m);
        const aLatex=P[0].toLatex(), bLatex=P[P.length-1].toLatex();
        const dif = tabla.superior - tabla.inferior;
        let resultado;
        const lineas=[
            {titulo:'Regla aplicada', latex:String.raw`\forall\varepsilon>0,\ \exists P\text{ partición de }[a,b]\text{ tal que }U(f,P)-L(f,P)<\varepsilon`, explicacion:'Una función es integrable por Darboux cuando la suma superior y la suma inferior pueden acercarse arbitrariamente.'},
            {latex:String.raw`f:[${aLatex},${bLatex}]\to\mathbb{R},\quad f(x)=${F.latex}`, explicacion:'Función ingresada directamente por el usuario.'},
            {latex:String.raw`${conjuntoLatex('P',P)}`, explicacion:'Partición usada para cortar el intervalo.'},
            {latex:String.raw`n=${P.length-1}`, explicacion:'Cantidad de subintervalos.'},
            {latex:String.raw`m_i=\inf\{f(x):x\in[t_{i-1},t_i]\},\quad M_i=\sup\{f(x):x\in[t_{i-1},t_i]\}`, explicacion:'Se estiman ínfimos y supremos con muestras numéricas.'},
            {latex:String.raw`L(f,P)=\sum_{i=1}^{n}m_i(t_i-t_{i-1})`, explicacion:'Suma inferior.'},
            {latex:String.raw`U(f,P)=\sum_{i=1}^{n}M_i(t_i-t_{i-1})`, explicacion:'Suma superior.'},
            {latex:String.raw`U(f,P)-L(f,P)`, explicacion:'La diferencia mide la separación entre ambas aproximaciones.'}
        ];
        if(tipoSuma === 'inferior') resultado=String.raw`L(f,P)\approx ${fmtLatexNum(tabla.inferior)}`;
        else if(tipoSuma === 'superior') resultado=String.raw`U(f,P)\approx ${fmtLatexNum(tabla.superior)}`;
        else resultado=String.raw`L(f,P)\approx ${fmtLatexNum(tabla.inferior)},\quad U(f,P)\approx ${fmtLatexNum(tabla.superior)}`;
        lineas.push(
            {latex:String.raw`L(f,P)\approx ${fmtLatexNum(tabla.inferior)},\quad U(f,P)\approx ${fmtLatexNum(tabla.superior)}`, explicacion:'Cálculo aproximado de ambas sumas.'},
            {latex:String.raw`U(f,P)-L(f,P)\approx ${fmtLatexNum(dif)}`, explicacion:'Separación entre suma superior e inferior.'},
            {latex:resultado, explicacion:'Resultado aproximado obtenido con la partición seleccionada.'}
        );
        const extra = `${textoDiagnosticoImpropria(diag)}${bloqueAdvertencia('Este resultado usa el criterio de Darboux. Los ínfimos y supremos de cada subintervalo se estiman con muestras numéricas.')}${tabla.html}${resultadoFinalHTML(resultado)}`;
        mostrarPasos('resultado-darboux','Integral de Darboux',lineas, extra);
    }catch(err){ mostrarError('resultado-darboux',err.message); }
}


async function calcularAutomatica(){
    try{
        const expresion = val('auto-exp').trim();
        let a = val('auto-a').trim();
        let b = val('auto-b').trim();
        const modo = val('auto-modo').trim();

        if(!expresion) throw new Error('Escribe el integrando. Ejemplo: 2*x*cos(x^2), x*exp(x), (3*x+5)/(x^2+x-2).');

        if(modo === 'indefinida'){
            a = '';
            b = '';
        }

        if(modo === 'definida' && (!a || !b)){
            throw new Error('Para integral definida escribe ambos límites de integración: límite inferior y límite superior.');
        }

        if((a && !b) || (!a && b)){
            throw new Error('Para integral definida escribe ambos límites: inferior y superior.');
        }

        const payload = {expresion};
        if(a && b){ payload.limite_inferior = a; payload.limite_superior = b; }
        const data = await pedirAPI('/api/integrales/automatica', payload);

        let titulo = 'Integral indefinida';
        if(a && b) titulo = 'Integral definida';
        if(data.metodo_nombre) titulo += `: ${formatearNombreMetodo(data.metodo_nombre)}`;

        mostrarRespuestaAPI('resultado-auto', titulo, data);
    }catch(err){ mostrarError('resultado-auto', err.message); }
}

function normalizarExpresionAnalitica(expr, variable='x'){
    let s = String(expr || '').trim();
    if(!s) throw new Error('Escribe una función.');
    if(s.includes('=')) s = s.split('=').pop().trim();
    s = s.replace(/,/g,'.')
         .replace(/π/g,'pi')
         .replace(/[φϕ]/g,'phi')
         .replace(/−/g,'-')
         .replace(/\bsen\b/gi,'sin')
         .replace(/\blog\b/gi,'log')
         .replace(/\^/g,'**');
    const v = variable === 't' ? 't' : 'x';
    const rg = new RegExp(`(\\d|\\)|${v}|pi|e|phi)(?=(${v}|pi|e|phi|sin|cos|tan|sqrt|log|exp|abs|\\())`,'gi');
    s = s.replace(rg,'$1*');
    return s;
}
function compilarFuncionAnalitica(expr, variable='x'){
    const s = normalizarExpresionAnalitica(expr, variable);
    if(!/^[0-9a-zA-Z_\.\+\-\*\/\(\)\s,]+$/.test(s)){
        throw new Error('La función contiene símbolos no permitidos. Usa números, x, +, -, *, /, ^, sen, cos, tan, sqrt, log, exp, pi, e o phi.');
    }
    const permitidas = new Set([variable.toLowerCase(),'x','t','pi','e','phi','sin','cos','tan','sqrt','log','exp','abs','pow']);
    const palabras = s.match(/[a-zA-Z_]+/g) || [];
    for(const palabra of palabras){
        if(!permitidas.has(palabra.toLowerCase())){
            throw new Error(`No reconozco "${palabra}". Usa x, sen, cos, tan, sqrt, log, exp, pi, e o phi.`);
        }
    }
    let fn;
    try{
        fn = new Function(variable, `
            const pi=Math.PI, e=Math.E, phi=(1+Math.sqrt(5))/2;
            const sin=Math.sin, cos=Math.cos, tan=Math.tan, sqrt=Math.sqrt;
            const log=Math.log, exp=Math.exp, abs=Math.abs, pow=Math.pow;
            return (${s});
        `);
    }catch(error){
        throw new Error('No pude interpretar la función. Revisa paréntesis y operadores.');
    }
    return (valor)=>{
        const y = Number(fn(valor));
        if(!Number.isFinite(y)) throw new Error(`La función no se puede evaluar correctamente en x=${fmtNum(valor)}.`);
        return y;
    };
}

function parseLimiteEsbozo(inputId,nombre){
    const crudo = val(inputId).trim();
    const normal = crudo.toLowerCase().replace(/∞/g,'inf').replace(/\s+/g,'');
    if(['inf','+inf','infty','+infty','infinito','+infinito'].includes(normal)){
        return {plain:'infty', latex:'\\infty', valor:Infinity, infinito:true};
    }
    if(['-inf','-infty','-infinito'].includes(normal)){
        return {plain:'-infty', latex:'-\\infty', valor:-Infinity, infinito:true};
    }
    const f = parse(inputId,nombre);
    return {plain:f.toPlain(), latex:f.toLatex(), valor:f.toNumber(), infinito:false};
}

function datosEsbozoIntegralDefinida(modo='antiderivada'){
    const expresion = val('auto-exp').trim();
    if(!expresion) throw new Error('Escribe el integrando antes de abrir el esbozo.');
    const payload = {
        expresion,
        expresion_latex: latexUsuarioBasico(expresion),
        modo,
        tipo: modo === 'rectangulos' ? 'definida' : 'indefinida'
    };
    const aTxt = val('auto-a').trim();
    const bTxt = val('auto-b').trim();

    if(modo === 'rectangulos'){
        if(!aTxt || !bTxt) throw new Error('Para ver rectángulos necesitas escribir límite inferior y superior.');
        const a = parseLimiteEsbozo('auto-a','límite inferior a');
        const b = parseLimiteEsbozo('auto-b','límite superior b');
        const an = a.valor, bn = b.valor;
        if(Number.isFinite(an) && Number.isFinite(bn) && bn <= an) throw new Error('El límite superior b debe ser mayor que el límite inferior a.');
        if(an === Infinity || bn === -Infinity) throw new Error('El intervalo infinito está orientado de forma inválida.');
        payload.a = a.plain;
        payload.b = b.plain;
        payload.a_latex = a.latex;
        payload.b_latex = b.latex;
        payload.a_num = an;
        payload.b_num = bn;
        payload.impropia_primera = a.infinito || b.infinito;
        payload.tipo = 'definida';
    }else if(aTxt && bTxt){
        const a = parseLimiteEsbozo('auto-a','límite inferior a');
        const b = parseLimiteEsbozo('auto-b','límite superior b');
        const an = a.valor, bn = b.valor;
        if(Number.isFinite(an) && Number.isFinite(bn) && bn <= an) throw new Error('El límite superior b debe ser mayor que el límite inferior a.');
        if(an === Infinity || bn === -Infinity) throw new Error('El intervalo infinito está orientado de forma inválida.');
        payload.a = a.plain;
        payload.b = b.plain;
        payload.a_latex = a.latex;
        payload.b_latex = b.latex;
        payload.a_num = an;
        payload.b_num = bn;
        payload.impropia_primera = a.infinito || b.infinito;
        payload.tipo = 'definida';
    }else{
        payload.a = '-5';
        payload.b = '5';
        payload.a_num = -5;
        payload.b_num = 5;
        payload.tipo = 'indefinida';
    }
    return payload;
}
function abrirEsbozoIntegralDefinida(modo='antiderivada'){
    try{
        const payload = datosEsbozoIntegralDefinida(modo);
        localStorage.setItem('esbozoIntegralDefinida', JSON.stringify(payload));
        window.open(`integral-definida-esbozo.html?modo=${encodeURIComponent(modo)}`, '_blank', 'noopener');
    }catch(err){
        mostrarError('resultado-auto', err.message);
    }
}
function obtenerConfiguracionEsbozoIntegralDefinida(){
    const guardado = localStorage.getItem('esbozoIntegralDefinida');
    if(!guardado) throw new Error('No encontré datos para el esbozo. Vuelve a la página de integral definida y abre el recurso otra vez.');
    const data = JSON.parse(guardado);
    const params = new URLSearchParams(window.location.search);
    data.modo = params.get('modo') || data.modo || 'antiderivada';
    return data;
}
function calcularAntiderivadaNumerica(xs, ys, referenciaX){
    const F = [0];
    for(let i=1;i<xs.length;i++){
        const h = xs[i] - xs[i-1];
        F.push(F[i-1] + 0.5*(ys[i-1] + ys[i])*h);
    }
    if(!Number.isFinite(referenciaX)) return F;
    let idxRef = 0;
    let mejor = Infinity;
    for(let i=0;i<xs.length;i++){
        const d = Math.abs(xs[i] - referenciaX);
        if(d < mejor){ mejor = d; idxRef = i; }
    }
    const ajuste = F[idxRef];
    return F.map(v=>v - ajuste);
}
function dibujarGraficaRectangulos(id, f, a, b, n=8, metodo='medio', opciones={}){
    const canvas = $(id);
    if(!canvas) return {aprox:0};
    const cont = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const cssW = Math.max(520, Math.floor((cont && cont.clientWidth) ? cont.clientWidth : 900));
    const cssH = Math.max(500, opciones.alto || 560);
    canvas.width = Math.floor(cssW*dpr);
    canvas.height = Math.floor(cssH*dpr);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,cssW,cssH);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0,0,cssW,cssH);

    const span = b-a;
    const extra = Math.max(span*0.18, 0.8);
    const xMin = a - extra;
    const xMax = b + extra;
    const muestras = 1000;
    const pts=[];
    for(let i=0;i<=muestras;i++){
        const x = xMin + (xMax-xMin)*i/muestras;
        let y;
        try{ y=f(x); }catch(_){ y=NaN; }
        if(Number.isFinite(y)) pts.push({x,y});
    }
    if(!pts.length) throw new Error('No se pudo dibujar la función en este intervalo.');
    let yMin = Math.min(...pts.map(p=>p.y), 0);
    let yMax = Math.max(...pts.map(p=>p.y), 0);
    [yMin,yMax] = rangoConMargen(yMin,yMax,0.18);
    let xxMin = xMin, xxMax = xMax;
    [xxMin,xxMax] = rangoConMargen(xxMin,xxMax,0.03);
    const ticksX = marcasLinealesGrafica(xxMin,xxMax,6);
    const ticksY = marcasLinealesGrafica(yMin,yMax,5);
    ctx.font='12px Arial';
    const pasoYPrevio=(yMax-yMin)/Math.max(1,ticksY.length-1);
    const anchoYMax=Math.max(...ticksY.map(v=>ctx.measureText(formatoNumeroGrafica(v,pasoYPrevio)).width), 24);
    const m={l:Math.max(96,Math.ceil(anchoYMax)+36),r:34,t:38,b:84};
    const w=cssW-m.l-m.r, h=cssH-m.t-m.b;
    const X=x=>m.l+((x-xxMin)/(xxMax-xxMin))*w;
    const Y=y=>m.t+h-((y-yMin)/(yMax-yMin))*h;

    ctx.fillStyle='#f8fafc';
    ctx.fillRect(m.l,m.t,w,h);
    ctx.strokeStyle='#e2e8f0';
    ctx.lineWidth=1;
    ctx.fillStyle='#475569';
    ctx.textAlign='center';
    ctx.textBaseline='top';
    const pasoX=(xxMax-xxMin)/Math.max(1,ticksX.length-1);
    ticksX.forEach(tx=>{
        const gx=X(tx);
        ctx.beginPath(); ctx.moveTo(gx,m.t); ctx.lineTo(gx,m.t+h); ctx.stroke();
        ctx.fillText(formatoNumeroGrafica(tx,pasoX), gx, m.t+h+18);
    });
    ctx.textAlign='right';
    ctx.textBaseline='middle';
    ticksY.forEach(ty=>{
        const gy=Y(ty);
        ctx.beginPath(); ctx.moveTo(m.l,gy); ctx.lineTo(m.l+w,gy); ctx.stroke();
        ctx.fillText(formatoNumeroGrafica(ty,pasoYPrevio), m.l-10, gy);
    });
    if(0>=xxMin && 0<=xxMax){ ctx.strokeStyle='#475569'; ctx.lineWidth=1.8; ctx.beginPath(); ctx.moveTo(X(0),m.t); ctx.lineTo(X(0),m.t+h); ctx.stroke(); }
    if(0>=yMin && 0<=yMax){ ctx.strokeStyle='#475569'; ctx.lineWidth=1.8; ctx.beginPath(); ctx.moveTo(m.l,Y(0)); ctx.lineTo(m.l+w,Y(0)); ctx.stroke(); }

    const dx=(b-a)/n;
    let aprox=0;
    ctx.save();
    ctx.rect(m.l,m.t,w,h); ctx.clip();
    for(let i=0;i<n;i++){
        const xI = a + i*dx;
        const xEval = metodo === 'izquierda' ? xI : (metodo === 'derecha' ? xI+dx : xI+dx/2);
        const altura = f(xEval);
        aprox += altura*dx;
        const x1 = X(xI), x2 = X(xI+dx), y0 = Y(0), y1 = Y(altura);
        const top = Math.min(y0,y1), alto = Math.abs(y0-y1), ancho = x2-x1;
        ctx.fillStyle = altura >= 0 ? 'rgba(37,99,235,0.22)' : 'rgba(220,38,38,0.18)';
        ctx.strokeStyle = altura >= 0 ? 'rgba(0, 0, 0, 0.5)' : 'rgba(220,38,38,0.45)';
        ctx.lineWidth = 1.1;
        ctx.fillRect(x1, top, ancho, alto);
        ctx.strokeRect(x1, top, ancho, alto);
    }
    ctx.beginPath();
    pts.forEach((p,i)=>{ const px=X(p.x), py=Y(p.y); if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py); });
    ctx.strokeStyle='#2563eb';
    ctx.lineWidth=3;
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle='#111827';
    ctx.lineWidth=1.2;
    ctx.strokeRect(m.l,m.t,w,h);
    ctx.fillStyle='#111827';
    ctx.font='bold 14px Arial';
    ctx.textAlign='center';
    ctx.fillText('x', m.l+w/2, cssH-24);
    ctx.save();
    ctx.translate(24, m.t+h/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText('y', 0, 0);
    ctx.restore();
    return {aprox};
}

let estadoEsbozoInteractivo = null;

function actualizarResumenEsbozo(htmlResumen, htmlInfo){
    const r = $('esbozo-resumen');
    const i = $('esbozo-info');
    if(r) r.innerHTML = htmlResumen;
    if(i) i.innerHTML = htmlInfo;
    renderMath(r); renderMath(i);
}

function percentilValores(valores, p){
    const arr = valores.filter(Number.isFinite).sort((a,b)=>a-b);
    if(!arr.length) return 0;
    const pos = (arr.length - 1) * p;
    const lo = Math.floor(pos), hi = Math.ceil(pos);
    if(lo === hi) return arr[lo];
    return arr[lo] + (arr[hi]-arr[lo]) * (pos-lo);
}

function rangoRobustoGrafica(valores){
    const limpios = valores.filter(v=>Number.isFinite(v) && Math.abs(v) < 1e9);
    if(!limpios.length) return [-5,5];
    let min = percentilValores(limpios, 0.03);
    let max = percentilValores(limpios, 0.97);
    if(min === max){
        const pad = Math.max(1, Math.abs(min)*0.35);
        return [min-pad, max+pad];
    }
    min = Math.min(min, 0);
    max = Math.max(max, 0);
    return rangoConMargen(min, max, 0.18);
}

function prepararMuestrasEsbozo(f, xMin, xMax, total=1600){
    const xs=[], ys=[];
    for(let i=0;i<=total;i++){
        const x = xMin + (xMax-xMin)*i/total;
        let y = NaN;
        try{ y = f(x); }catch(_){ y = NaN; }
        xs.push(x);
        ys.push(Number.isFinite(y) ? y : NaN);
    }
    return {xs, ys};
}

function antiderivadaNumericaDesdeMuestras(xs, ys, referencia=0){
    const F = new Array(xs.length).fill(NaN);
    let ref = 0, mejor = Infinity;
    for(let i=0;i<xs.length;i++){
        if(Number.isFinite(ys[i])){
            const d = Math.abs(xs[i]-referencia);
            if(d < mejor){ mejor = d; ref = i; }
        }
    }
    F[ref] = 0;
    for(let i=ref+1;i<xs.length;i++){
        if(!Number.isFinite(ys[i]) || !Number.isFinite(ys[i-1]) || !Number.isFinite(F[i-1])){
            F[i] = NaN;
        }else{
            F[i] = F[i-1] + 0.5*(ys[i-1]+ys[i])*(xs[i]-xs[i-1]);
        }
    }
    for(let i=ref-1;i>=0;i--){
        if(!Number.isFinite(ys[i]) || !Number.isFinite(ys[i+1]) || !Number.isFinite(F[i+1])){
            F[i] = NaN;
        }else{
            F[i] = F[i+1] - 0.5*(ys[i]+ys[i+1])*(xs[i+1]-xs[i]);
        }
    }
    return F;
}

function configurarVistaInicialEsbozo(estado){
    const a = Number(estado.data.a_num);
    const b = Number(estado.data.b_num);
    let xMin, xMax;
    if(estado.data.tipo === 'definida'){
        if(!Number.isFinite(a) && !Number.isFinite(b)){
            xMin = -10; xMax = 10;
        }else if(!Number.isFinite(a)){
            xMax = b; xMin = b - 10;
        }else if(!Number.isFinite(b)){
            xMin = a; xMax = a + 10;
        }else{
            const span = Math.max(Math.abs(b-a), 1);
            xMin = a - span*0.18;
            xMax = b + span*0.18;
        }
    }else{
        xMin = -5;
        xMax = 5;
    }
    const muestras = prepararMuestrasEsbozo(estado.f, xMin, xMax, 1300);
    const ys = muestras.ys.slice();
    if(estado.modo === 'antiderivada'){
        const ref = estado.data.tipo === 'definida' ? a : 0;
        const Fs = antiderivadaNumericaDesdeMuestras(muestras.xs, muestras.ys, ref);
        ys.push(...Fs);
    }
    let [yMin,yMax] = rangoRobustoGrafica(ys);
    estado.vistaInicial = {xMin, xMax, yMin, yMax};
    estado.vista = {...estado.vistaInicial};
}

function transformarCanvasEsbozo(canvas, vista, m, w, h){
    return {
        X: x => m.l + ((x - vista.xMin)/(vista.xMax-vista.xMin))*w,
        Y: y => m.t + h - ((y - vista.yMin)/(vista.yMax-vista.yMin))*h,
        invX: px => vista.xMin + ((px-m.l)/w)*(vista.xMax-vista.xMin),
        invY: py => vista.yMin + ((m.t+h-py)/h)*(vista.yMax-vista.yMin)
    };
}

function dibujarLineaSerieEsbozo(ctx, pts, X, Y, color, ancho=3.2, yMin, yMax){
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = ancho;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    let iniciado = false;
    const rangoY = Math.abs(yMax-yMin) || 1;
    let prev = null;
    pts.forEach(p=>{
        if(!Number.isFinite(p.x) || !Number.isFinite(p.y)){
            iniciado = false; prev = null; return;
        }
        const salto = prev && Math.abs(p.y - prev.y) > rangoY * 0.70;
        const fueraAmbos = prev && ((p.y > yMax && prev.y > yMax) || (p.y < yMin && prev.y < yMin));
        const px = X(p.x), py = Y(p.y);
        if(!iniciado || salto || fueraAmbos){
            ctx.moveTo(px,py);
            iniciado = true;
        }else{
            ctx.lineTo(px,py);
        }
        prev = p;
    });
    ctx.stroke();
    ctx.restore();
}

function dibujarPlanoEsbozo(){
    const estado = estadoEsbozoInteractivo;
    if(!estado) return;
    const canvas = $('esbozo-canvas');
    if(!canvas) return;
    const cont = canvas.parentElement;
    const dpr = Math.max(2, window.devicePixelRatio || 1);
    const cssW = Math.max(760, Math.floor((cont && cont.clientWidth) ? cont.clientWidth : 1100));
    const cssH = Math.max(620, estado.alto || 680);
    canvas.width = Math.floor(cssW*dpr);
    canvas.height = Math.floor(cssH*dpr);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,cssW,cssH);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0,0,cssW,cssH);

    const vista = estado.vista;
    const ticksX = marcasLinealesGrafica(vista.xMin, vista.xMax, 8);
    const ticksY = marcasLinealesGrafica(vista.yMin, vista.yMax, 7);
    ctx.font = '13px Arial';
    const pasoY = (vista.yMax-vista.yMin)/Math.max(1,ticksY.length-1);
    const anchoYMax = Math.max(...ticksY.map(v=>ctx.measureText(formatoNumeroGrafica(v,pasoY)).width), 26);
    const m = {l:Math.max(76, Math.ceil(anchoYMax)+30), r:28, t:24, b:70};
    const w = cssW - m.l - m.r;
    const h = cssH - m.t - m.b;
    const {X,Y,invX,invY} = transformarCanvasEsbozo(canvas, vista, m, w, h);

    ctx.fillStyle = '#fbfdff';
    ctx.fillRect(m.l,m.t,w,h);

    ctx.save();
    ctx.rect(m.l,m.t,w,h);
    ctx.clip();

    const pasoX = (vista.xMax-vista.xMin)/Math.max(1,ticksX.length-1);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#e6edf5';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ticksX.forEach(tx=>{
        const gx = X(tx);
        ctx.beginPath(); ctx.moveTo(gx,m.t); ctx.lineTo(gx,m.t+h); ctx.stroke();
    });
    ticksY.forEach(ty=>{
        const gy = Y(ty);
        ctx.beginPath(); ctx.moveTo(m.l,gy); ctx.lineTo(m.l+w,gy); ctx.stroke();
    });

    // Cuadrícula auxiliar en enteros para lectura tipo plano cartesiano.
    if(vista.xMax - vista.xMin <= 60){
        ctx.strokeStyle = '#d1d9e6';
        ctx.lineWidth = 1.1;
        for(let k=Math.ceil(vista.xMin); k<=Math.floor(vista.xMax); k++){
            const gx = X(k);
            ctx.beginPath(); ctx.moveTo(gx,m.t); ctx.lineTo(gx,m.t+h); ctx.stroke();
        }
    }
    if(vista.yMax - vista.yMin <= 60){
        ctx.strokeStyle = '#d1d9e6';
        ctx.lineWidth = 1.1;
        for(let k=Math.ceil(vista.yMin); k<=Math.floor(vista.yMax); k++){
            const gy = Y(k);
            ctx.beginPath(); ctx.moveTo(m.l,gy); ctx.lineTo(m.l+w,gy); ctx.stroke();
        }
    }

    if(vista.xMin <= 0 && vista.xMax >= 0){
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(X(0),m.t); ctx.lineTo(X(0),m.t+h); ctx.stroke();
    }
    if(vista.yMin <= 0 && vista.yMax >= 0){
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(m.l,Y(0)); ctx.lineTo(m.l+w,Y(0)); ctx.stroke();
    }

    const muestras = prepararMuestrasEsbozo(estado.f, vista.xMin, vista.xMax, 2200);
    const ptsF = muestras.xs.map((x,i)=>({x, y:muestras.ys[i]}));

    let aprox = null;
    if(estado.modo === 'rectangulos'){
        const a = Number(estado.data.a_num);
        const b = Number(estado.data.b_num);
        const n = estado.n;
        if(Number.isInteger(n) && n >= 1 && n <= 100 && Number.isFinite(a) && Number.isFinite(b) && !estado.diagnostico?.impropia){
            const dx = (b-a)/n;
            let suma = 0;
            for(let i=0;i<n;i++){
                const xI = a + i*dx;
                const xEval = estado.metodo === 'izquierda' ? xI : (estado.metodo === 'derecha' ? xI+dx : xI+dx/2);
                let altura = NaN;
                try{ altura = estado.f(xEval); }catch(_){ altura = NaN; }
                if(!Number.isFinite(altura)){ suma = NaN; continue; }
                suma += altura*dx;
                const x1 = X(xI), x2 = X(xI+dx), y0 = Y(0), y1 = Y(altura);
                ctx.fillStyle = altura >= 0 ? 'rgba(37,99,235,0.20)' : 'rgba(239,68,68,0.17)';
                ctx.strokeStyle = altura >= 0 ? 'rgba(37,99,235,0.65)' : 'rgba(239,68,68,0.60)';
                ctx.lineWidth = 1.4;
                ctx.fillRect(x1, Math.min(y0,y1), x2-x1, Math.abs(y0-y1));
                ctx.strokeRect(x1, Math.min(y0,y1), x2-x1, Math.abs(y0-y1));
            }
            aprox = suma;
        }else{
            aprox = NaN;
        }
    }

    dibujarLineaSerieEsbozo(ctx, ptsF, X, Y, '#2563eb', 3.4, vista.yMin, vista.yMax);

    let valorCambioF = null;
    if(estado.modo === 'antiderivada'){
        const ref = estado.data.tipo === 'definida' ? Number(estado.data.a_num) : 0;
        const Fs = antiderivadaNumericaDesdeMuestras(muestras.xs, muestras.ys, ref);
        const ptsFint = muestras.xs.map((x,i)=>({x, y:Fs[i]}));
        dibujarLineaSerieEsbozo(ctx, ptsFint, X, Y, '#dc2626', 3.2, vista.yMin, vista.yMax);
        if(estado.data.tipo === 'definida'){
            let idx = 0, mejor = Infinity;
            const b = Number(estado.data.b_num);
            for(let i=0;i<muestras.xs.length;i++){
                const d = Math.abs(muestras.xs[i]-b);
                if(d < mejor && Number.isFinite(Fs[i])){ mejor = d; idx = i; }
            }
            valorCambioF = Fs[idx];
        }
    }

    const marcarLimite = (x, etiqueta)=>{
        if(!Number.isFinite(x) || x < vista.xMin || x > vista.xMax) return;
        ctx.save();
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([7,6]);
        ctx.beginPath(); ctx.moveTo(X(x),m.t); ctx.lineTo(X(x),m.t+h); ctx.stroke();
        ctx.restore();
    };
    if(estado.data.tipo === 'definida'){
        marcarLimite(Number(estado.data.a_num),'a');
        marcarLimite(Number(estado.data.b_num),'b');
    }

    ctx.restore();

    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(m.l,m.t,w,h);

    ctx.fillStyle = '#334155';
    ctx.font = '13px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ticksX.forEach(tx=>{
        const gx = X(tx);
        if(gx >= m.l-2 && gx <= m.l+w+2) ctx.fillText(formatoNumeroGrafica(tx,pasoX), gx, m.t+h+18);
    });
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ticksY.forEach(ty=>{
        const gy = Y(ty);
        if(gy >= m.t-2 && gy <= m.t+h+2) ctx.fillText(formatoNumeroGrafica(ty,pasoY), m.l-10, gy);
    });
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('x', m.l+w/2, cssH-24);
    ctx.save();
    ctx.translate(22, m.t+h/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText('y', 0, 0);
    ctx.restore();

    const leyenda = estado.modo === 'antiderivada'
        ? [{t:'f(x)',c:'#2563eb'},{t:'Antiderivada',c:'#dc2626'}]
        : [{t:'f(x)',c:'#2563eb'},{t:'rectángulos',c:'#60a5fa'}];
    let lx = m.l + 14, ly = m.t + 18;
    ctx.save();
    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    const legendW = 150, legendH = 26*leyenda.length + 12;
    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(lx-10,ly-12,legendW,legendH,10);
    else ctx.rect(lx-10,ly-12,legendW,legendH);
    ctx.fill(); ctx.stroke();
    leyenda.forEach((item,i)=>{
        ctx.strokeStyle = item.c;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(lx,ly+i*26); ctx.lineTo(lx+28,ly+i*26); ctx.stroke();
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.t,lx+38,ly+i*26);
    });
    ctx.restore();

    estado.ultimaTransformacion = {m,w,h,X,Y,invX,invY};
    estado.ultimoResultado = {aprox, valorCambioF};
    actualizarInfoEsbozoDesdeEstado();
}

function actualizarInfoEsbozoDesdeEstado(){
    const estado = estadoEsbozoInteractivo;
    if(!estado) return;
    if(estado.modo === 'rectangulos'){
        const aprox = estado.ultimoResultado?.aprox;
        const metodoTxt = {'izquierda':'Extremo izquierdo','derecha':'Extremo derecho','medio':'Punto medio'}[estado.metodo] || estado.metodo;
        actualizarResumenEsbozo(
            `<h4>Datos</h4><div class="chips-datos-esbozo"><span><b>f(x):</b> \(${estado.data.expresion_latex}\)</span><span><b>Intervalo:</b> \([${latexUsuarioBasico(estado.data.a)},${latexUsuarioBasico(estado.data.b)}]\)</span><span><b>n:</b> ${estado.n || 'pendiente'}</span><span><b>Método:</b> ${escapeHtml(metodoTxt)}</span></div>`,
            `${textoDiagnosticoImpropria(estado.diagnostico)}<h4>Lectura rápida</h4><div class="chips-datos-esbozo"><span>Los rectángulos aproximan el área bajo la curva.</span><span>Mientras más grande sea \(n\), mejor se rellena el área.</span>${!estado.n ? '<span><b>Entrada requerida:</b> ingresa un número natural de 1 a 100.</span>' : ''}<span><b>Aproximación:</b> ${valorNumericoOMensaje(aprox)}</span></div>`
        );
    }else{
        const definida = estado.data.tipo === 'definida';
        actualizarResumenEsbozo(
            `<h4>Datos</h4><div class="chips-datos-esbozo"><span><b>f(x):</b> \(${estado.data.expresion_latex}\)</span>${definida ? `<span><b>Intervalo:</b> \([${latexUsuarioBasico(estado.data.a)},${latexUsuarioBasico(estado.data.b)}]\)</span>` : `<span><b>Vista inicial:</b> de -5 a 5</span>`}<span><b>Roja:</b> antiderivada aproximada</span></div>`,
            `${textoDiagnosticoImpropria(estado.diagnostico)}<h4>Lectura rápida</h4><div class="chips-datos-esbozo"><span>Azul: función original.</span><span>Roja: antiderivada aproximada.</span>${definida ? `<span><b>Cambio aproximado:</b> ${valorNumericoOMensaje(estado.ultimoResultado?.valorCambioF)}</span>` : ''}</div>`
        );
    }
}

function instalarEventosEsbozo(){
    const estado = estadoEsbozoInteractivo;
    const canvas = $('esbozo-canvas');
    if(!estado || !canvas || estado.eventosInstalados) return;
    estado.eventosInstalados = true;
    let arrastrando = false;
    let ultimo = null;

    function pos(evt){
        const r = canvas.getBoundingClientRect();
        return {x:evt.clientX-r.left, y:evt.clientY-r.top};
    }

    canvas.addEventListener('mousedown', evt=>{
        arrastrando = true;
        ultimo = pos(evt);
        canvas.classList.add('arrastrando-grafica');
    });
    window.addEventListener('mouseup', ()=>{
        arrastrando = false;
        ultimo = null;
        canvas.classList.remove('arrastrando-grafica');
    });
    window.addEventListener('mousemove', evt=>{
        const p = pos(evt);
        const tr = estado.ultimaTransformacion;
        if(tr){
            const x = tr.invX(p.x);
            const y = tr.invY(p.y);
            const coord = $('esbozo-coordenadas');
            if(coord) coord.textContent = `x = ${fmtCinematicaResultado(x)}, y = ${fmtCinematicaResultado(y)}`;
        }
        if(!arrastrando || !ultimo || !tr) return;
        const dx = p.x - ultimo.x;
        const dy = p.y - ultimo.y;
        const vx = estado.vista.xMax - estado.vista.xMin;
        const vy = estado.vista.yMax - estado.vista.yMin;
        estado.vista.xMin -= dx/tr.w * vx;
        estado.vista.xMax -= dx/tr.w * vx;
        estado.vista.yMin += dy/tr.h * vy;
        estado.vista.yMax += dy/tr.h * vy;
        ultimo = p;
        dibujarPlanoEsbozo();
    });
    canvas.addEventListener('wheel', evt=>{
        evt.preventDefault();
        const p = pos(evt);
        const tr = estado.ultimaTransformacion;
        if(!tr) return;
        const centroX = tr.invX(p.x);
        const centroY = tr.invY(p.y);
        const factor = evt.deltaY < 0 ? 0.82 : 1.22;
        aplicarZoomEsbozo(factor, centroX, centroY);
    }, {passive:false});
}

function aplicarZoomEsbozo(factor, centroX=null, centroY=null){
    const estado = estadoEsbozoInteractivo;
    if(!estado) return;
    if(!Number.isFinite(centroX)) centroX = (estado.vista.xMin+estado.vista.xMax)/2;
    if(!Number.isFinite(centroY)) centroY = (estado.vista.yMin+estado.vista.yMax)/2;
    estado.vista.xMin = centroX + (estado.vista.xMin-centroX)*factor;
    estado.vista.xMax = centroX + (estado.vista.xMax-centroX)*factor;
    estado.vista.yMin = centroY + (estado.vista.yMin-centroY)*factor;
    estado.vista.yMax = centroY + (estado.vista.yMax-centroY)*factor;
    dibujarPlanoEsbozo();
}

function zoomEsbozoGrafica(factor){
    aplicarZoomEsbozo(factor);
}

function resetEsbozoGrafica(){
    const estado = estadoEsbozoInteractivo;
    if(!estado || !estado.vistaInicial) return;
    estado.vista = {...estado.vistaInicial};
    dibujarPlanoEsbozo();
}

function crearEstadoEsbozo(data, modo){
    const f = compilarFuncionAnalitica(data.expresion, 'x');
    const estado = {
        data,
        modo,
        f,
        n:null,
        metodo:'medio',
        alto:680,
        vista:null,
        vistaInicial:null,
        eventosInstalados:false,
        diagnostico:null
    };
    if(modo === 'rectangulos'){
        const nInput = $('esbozo-n');
        const crudo = nInput ? String(nInput.value || '').trim() : '';
        if(crudo){
            if(!/^\d+$/.test(crudo)) throw new Error('El número de rectángulos debe ser un número natural.');
            let n = parseInt(crudo,10);
            if(n < 1 || n > 100) throw new Error('El número de rectángulos debe estar entre 1 y 100.');
            estado.n = n;
        }
        estado.metodo = val('esbozo-metodo') || 'medio';
    }
    configurarVistaInicialEsbozo(estado);
    const a = Number.isFinite(Number(data.a_num)) ? Number(data.a_num) : estado.vistaInicial.xMin;
    const b = Number.isFinite(Number(data.b_num)) ? Number(data.b_num) : estado.vistaInicial.xMax;
    estado.diagnostico = diagnosticarImpropriedadFuncion(f,a,b);
    if(data.impropia_primera){
        estado.diagnostico.impropia = true;
        estado.diagnostico.razones.unshift('Integral impropia de primera especie: al menos un límite de integración es infinito. La gráfica usa una ventana finita como posible vista.');
    }
    return estado;
}

function renderizarEsbozoAntiderivada(data){
    const titulo = $('esbozo-grafica-titulo');
    if(titulo) titulo.textContent = 'Función original y antiderivada';
    const panel = $('esbozo-control-rectangulos');
    if(panel) panel.style.display = 'none';
    estadoEsbozoInteractivo = crearEstadoEsbozo(data, 'antiderivada');
    if(titulo && estadoEsbozoInteractivo.diagnostico?.impropia) titulo.textContent = 'Función original y antiderivada: posible vista';
    instalarEventosEsbozo();
    dibujarPlanoEsbozo();
}

function renderizarEsbozoRectangulos(data){
    const titulo = $('esbozo-grafica-titulo');
    if(titulo) titulo.textContent = 'Área bajo la curva con rectángulos';
    const panel = $('esbozo-control-rectangulos');
    if(panel) panel.style.display = 'block';
    estadoEsbozoInteractivo = crearEstadoEsbozo(data, 'rectangulos');
    if(titulo && estadoEsbozoInteractivo.diagnostico?.impropia) titulo.textContent = 'Área bajo la curva con rectángulos: posible vista';
    instalarEventosEsbozo();
    dibujarPlanoEsbozo();
}

function actualizarEsbozoIntegralDefinida(){
    try{
        const data = obtenerConfiguracionEsbozoIntegralDefinida();
        if(data.modo === 'rectangulos'){
            if(estadoEsbozoInteractivo && estadoEsbozoInteractivo.modo === 'rectangulos'){
                const nInput = $('esbozo-n');
                const crudo = nInput ? String(nInput.value || '').trim() : '';
                if(crudo && !/^\d+$/.test(crudo)) throw new Error('El número de rectángulos debe ser un número natural.');
                const n = crudo ? parseInt(crudo,10) : null;
                if(n !== null && (n < 1 || n > 100)) throw new Error('El número de rectángulos debe estar entre 1 y 100.');
                estadoEsbozoInteractivo.n = n;
                estadoEsbozoInteractivo.metodo = val('esbozo-metodo') || 'medio';
                dibujarPlanoEsbozo();
            }else{
                renderizarEsbozoRectangulos(data);
            }
        }else{
            renderizarEsbozoAntiderivada(data);
        }
    }catch(err){
        const info = $('esbozo-info');
        if(info) info.innerHTML = `<div class="error">${escapeHtml(err.message)}</div>`;
    }
}

function inicializarPaginaEsbozoIntegralDefinida(){
    try{
        const data = obtenerConfiguracionEsbozoIntegralDefinida();
        const titulo = $('esbozo-titulo');
        const desc = $('esbozo-descripcion');
        const volver = $('esbozo-volver');
        if(volver){
            if(data.tipo === 'indefinida'){
                volver.href = 'integral-indefinida.html';
                volver.textContent = '← Volver a Integral Indefinida';
            }else{
                volver.href = 'integral-definida.html';
                volver.textContent = '← Volver a Integral Definida';
            }
        }
        if(data.modo === 'rectangulos'){
            if(titulo) titulo.textContent = 'ESBOZO DEL ÁREA BAJO LA CURVA';
            if(desc) desc.textContent = 'Esta ventana muestra la función original y una aproximación del área bajo la curva mediante rectángulos. Puedes ajustar el número de rectángulos hasta 100.';
            const nInput = $('esbozo-n');
            if(nInput){
                nInput.addEventListener('input', ()=>{
                    const crudo = String(nInput.value || '').trim();
                    if(crudo && /^\d+$/.test(crudo)){
                        let n = parseInt(crudo,10);
                        if(n > 100) nInput.value = '100';
                        if(n < 1) nInput.value = '';
                    }
                    actualizarEsbozoIntegralDefinida();
                });
            }
            const sel = $('esbozo-metodo');
            if(sel) sel.addEventListener('change', actualizarEsbozoIntegralDefinida);
        }else{
            if(titulo) titulo.textContent = 'ESBOZO DE LA FUNCIÓN Y SU ANTIDERIVADA';
            if(desc) desc.textContent = 'Esta ventana superpone la función original con una antiderivada aproximada. Puedes mover el plano, acercarte y alejarte como apoyo visual.';
        }
        actualizarEsbozoIntegralDefinida();
        window.addEventListener('resize', ()=>{ if(estadoEsbozoInteractivo) dibujarPlanoEsbozo(); });
    }catch(err){
        const info = $('esbozo-info');
        if(info) info.innerHTML = `<div class="error">${escapeHtml(err.message)}</div>`;
    }
}

function renderMetodoForm(){
    const tipo=val('tipo-metodo'), zona=$('form-metodo'); limpiarResultado('resultado-metodo'); if(!zona) return;
    if(tipo==='cambio'){
        zona.innerHTML = `<div class="buscador-symbolab"><div class="ayuda">Cambio de variable por composición. Escribe los dos factores del teorema: la función compuesta \(f(g(x))\) y el factor derivada \(g'(x)\). Por ejemplo, para \(\int 2x\cos(x^2)\,dx\) escribe \(\cos(x^2)\) y \(2x\). No uses \(u\) ni despejes \(x\).</div><div class="grid-form">${inputMath('Función compuesta f(g(x))','cv-compuesta','Ej. cos(x^2)',false)}${inputMath("Factor derivada g'(x)",'cv-derivada','Ej. 2*x',false)}</div><div class="botones"><button type="button" onclick="Calculadora.calcularCambioVariable()">Calcular paso a paso</button></div></div>`;
    }else if(tipo==='partes'){
        zona.innerHTML = `<div class="buscador-symbolab"><div class="ayuda">Integración por partes automática. Escribe solo el integrando; el sistema identifica \(f(x)\), \(g'(x)\), \(f'(x)\), \(g(x)\), aplica el teorema y resuelve la integral restante.</div><div class="grid-form">${inputMath('Integrando','pp-integrando','Ej. x*exp(x), x*sen(x), log(x)',true)}</div><div class="botones"><button type="button" onclick="Calculadora.calcularPorPartes()">Calcular paso a paso</button></div></div>`;
    }else if(tipo==='trigsub'){
        zona.innerHTML = `<div class="grid-form"><div class="campo"><label>Tipo</label><select id="st-tipo"><option value="1">∫ sqrt(a^2 - x^2) dx</option><option value="2">∫ 1/sqrt(a^2 - x^2) dx</option><option value="3">∫ sqrt(a^2 + x^2) dx</option><option value="4">∫ 1/sqrt(a^2 + x^2) dx</option><option value="5">∫ sqrt(x^2 - a^2) dx</option></select></div>${campo('a','st-a','text','Ej. 3')}</div><div class="botones"><button type="button" onclick="Calculadora.calcularSustTrig()">Calcular</button></div>`;
    }else if(tipo==='fracciones'){
        zona.innerHTML = `<div class="buscador-symbolab"><div class="ayuda">Fracciones parciales con función racional original o ya separada. Puedes escribir formas como \((3x+5)/(x^2+x-2)\), \(3/(x-2)+5/(x+1)\), \(x^2/(x+1)\) o incluso \(\int (3x+5)/(x^2+x-2)\,dx\).</div><div class="grid-form">${inputMath('Función racional','fp-exp','Ej. (3*x+5)/(x^2+x-2)',true)}</div><div class="botones"><button type="button" onclick="Calculadora.calcularFraccionesParciales()">Calcular paso a paso</button></div></div>`;
    }
    renderMath();
}
function textLatex(s){ return String(s||'').trim().replace(/\*/g,'').replace(/sen/g,'\\operatorname{sen}').replace(/cos/g,'\\cos').replace(/sqrt\(([^)]+)\)/g,'\\sqrt{$1}').replace(/\^\(([^)]+)\)/g,'^{$1}').replace(/\^([\w\d+-]+)/g,'^{$1}'); }
async function calcularCambioVariable(){
    try{
        const compuesta=val('cv-compuesta').trim();
        const derivada=val('cv-derivada').trim();
        if(!compuesta || !derivada) throw new Error("Escribe la función compuesta f(g(x)) y el factor derivada g'(x). Ejemplo: cos(x^2) y 2*x.");
        const data = await pedirAPI('/api/metodos/cambio-variable', {compuesta, derivada});
        mostrarRespuestaAPI('resultado-metodo','Cambio de variable', data);
    }catch(err){ mostrarError('resultado-metodo',err.message); }
}
async function calcularPorPartes(){
    try{
        const integrando=val('pp-integrando').trim();
        if(!integrando) throw new Error('Escribe el integrando.');
        const data = await pedirAPI('/api/metodos/por-partes', {integrando});
        mostrarRespuestaAPI('resultado-metodo','Integración por partes', data);
    }catch(err){ mostrarError('resultado-metodo',err.message); }
}
function calcularSustTrig(){
    try{
        const a=parse('st-a','a'); if(a.isZero()) throw new Error('a debe ser distinto de 0.'); const A=a.abs(); const A2=A.mul(A); const tipo=val('st-tipo');
        const sqMinus=`${A2.toLatex()}-x^2`, sqPlus=`x^2+${A2.toLatex()}`, sqXMinus=`x^2-${A2.toLatex()}`;
        let integral,cambio,res;
        if(tipo==='1'){ integral=`\\int \\sqrt{${sqMinus}}\\,dx`; cambio=`x=${A.toLatex()}\\operatorname{sen}(\\theta)`; res=`\\frac{x}{2}\\sqrt{${sqMinus}}+\\frac{${A2.toLatex()}}{2}\\operatorname{arcsen}\\left(\\frac{x}{${A.toLatex()}}\\right)+C`; }
        else if(tipo==='2'){ integral=`\\int \\frac{1}{\\sqrt{${sqMinus}}}\\,dx`; cambio=`x=${A.toLatex()}\\operatorname{sen}(\\theta)`; res=`\\operatorname{arcsen}\\left(\\frac{x}{${A.toLatex()}}\\right)+C`; }
        else if(tipo==='3'){ integral=`\\int \\sqrt{${sqPlus}}\\,dx`; cambio=`x=${A.toLatex()}\\tan(\\theta)`; res=`\\frac{x}{2}\\sqrt{${sqPlus}}+\\frac{${A2.toLatex()}}{2}\\log\\left|x+\\sqrt{${sqPlus}}\\right|+C`; }
        else if(tipo==='4'){ integral=`\\int \\frac{1}{\\sqrt{${sqPlus}}}\\,dx`; cambio=`x=${A.toLatex()}\\tan(\\theta)`; res=`\\log\\left|x+\\sqrt{${sqPlus}}\\right|+C`; }
        else { integral=`\\int \\sqrt{${sqXMinus}}\\,dx`; cambio=`x=${A.toLatex()}\\sec(\\theta)`; res=`\\frac{x}{2}\\sqrt{${sqXMinus}}-\\frac{${A2.toLatex()}}{2}\\log\\left|x+\\sqrt{${sqXMinus}}\\right|+C`; }
        mostrarPasos('resultado-metodo','Sustitución trigonométrica',[integral, `\\text{Cambio usado: } ${cambio}`, `\\text{Resultado: } ${res}`]);
    }catch(err){ mostrarError('resultado-metodo',err.message); }
}
async function calcularFraccionesParciales(){
    try{
        const expresion=val('fp-exp').trim();
        if(!expresion) throw new Error('Escribe una función racional.');
        const data = await pedirAPI('/api/metodos/fracciones-parciales', {expresion});
        mostrarRespuestaAPI('resultado-metodo','Fracciones parciales', data);
    }catch(err){ mostrarError('resultado-metodo',err.message); }
}

function renderCinematicaForm(){
    const tipo=val('tipo-cin'), zona=$('form-cin'); limpiarResultado('resultado-cin'); if(!zona) return; estados.cin=[];
    const selector = `<div class="campo"><label>Tipo de función</label><select id="cin-tipo" onchange="Calculadora.renderFuncionSelector('cin','cin')"><option value="constante">Constante</option><option value="potencia">Potencia t^n</option><option value="exponencial">A e^(kt)</option><option value="sen">sen(t)</option><option value="cos">cos(t)</option><option value="polinomio">Polinomio</option></select></div><div id="cin-params"></div>`;
    const tiemposGrafica = `${campo('Tiempo inicial t1','cin-t1','text','Ej. 0')}${campo('Tiempo final t2','cin-t2','text','Ej. 5')}`;
    if(tipo==='velocidad' || tipo==='posicion'){
        const etiqueta = tipo==='velocidad' ? 'Velocidad inicial v(t1)' : 'Posición inicial x(t1)';
        zona.innerHTML = `<div class="ayuda">Ingresa la función respecto a \\(t\\). También indica el intervalo de tiempo para graficar el movimiento del automóvil.</div><div class="grid-form">${selector}${campo(etiqueta,'cin-c0','text','Ej. 0, 2, 3/4')}${tiemposGrafica}</div><div class="botones"><button type="button" onclick="Calculadora.calcularCinematicaIndef()">Calcular y graficar</button></div>`;
    }else{
        zona.innerHTML = `<div class="ayuda">Ingresa la función respecto a \\(t\\), los tiempos y la página aproxima la integral con regla del trapecio.</div><div class="grid-form">${selector}${tiemposGrafica}</div><div class="botones"><button type="button" onclick="Calculadora.calcularCinematicaDef()">Calcular y graficar</button></div>`;
    }
    renderFuncionSelector('cin','cin'); renderMath();
}
function obtenerFuncionCin(){
    const tipo = val('cin-tipo');
    if(tipo === 'constante'){
        const k=parse('cin-k','k');
        return {f:()=>k.toNumber(), latex:k.toLatex(), antiLatex:(C)=>`${productoLatex(k,'t')}${C}`};
    }
    if(tipo === 'potencia'){
        const n=parse('cin-n','n');
        if(n.eqInt(-1)) return {f:t=>1/t, latex:`t^{-1}`, antiLatex:(C)=>`\\log|t|${C}`};
        const anti=antiderivadaTermino(uno(),n,'t');
        return {f:t=>Math.pow(t,n.toNumber()), latex:`t^{${n.toLatex()}}`, antiLatex:(C)=>`${anti}${C}`};
    }
    if(tipo === 'exponencial'){
        const A=parse('cin-A','A'), k=parse('cin-ek','k');
        let anti;
        if(k.isZero()) anti=productoLatex(A,'t');
        else anti=productoLatex(A.div(k),`e^{${k.toLatex()}t}`);
        return {f:t=>A.toNumber()*Math.exp(k.toNumber()*t), latex:productoLatex(A,`e^{${k.toLatex()}t}`), antiLatex:(C)=>`${anti}${C}`};
    }
    if(tipo === 'sen') return {f:Math.sin, latex:'\\operatorname{sen}(t)', antiLatex:(C)=>`-\\cos(t)${C}`};
    if(tipo === 'cos') return {f:Math.cos, latex:'\\cos(t)', antiLatex:(C)=>`\\operatorname{sen}(t)${C}`};
    if(tipo === 'polinomio'){
        if(!estados.cin.length) throw new Error('Agrega al menos un término al polinomio.');
        const anti=antiderivadaPolinomio(estados.cin,'t');
        return {f:t=>valorPolinomio(estados.cin,t), latex:polinomioLatex(estados.cin,'t'), antiLatex:(C)=>`${anti}${C}`};
    }
    throw new Error('Selecciona un tipo de función válido.');
}
function calcularCinematicaIndef(){
    try{
        const tipo=val('tipo-cin'), F=obtenerFuncionCin();
        const C=parse('cin-c0','constante inicial');
        const t1=parse('cin-t1','t_1'), t2=parse('cin-t2','t_2');
        const a=t1.toNumber(), b=t2.toNumber();
        if(b <= a) throw new Error('El tiempo final debe ser mayor que el tiempo inicial.');
        const duracion=b-a;
        const muestras=muestrasCinematica(F.f,a,b);
        const acumulado=integrarAcumuladaCinematica(muestras.xs,muestras.ys,C.toNumber());
        const cambioTotal=trapecio(F.f,a,b,2000,false);
        const valorFinal=C.toNumber()+cambioTotal;
        const cambioTxt=fmtCinematicaResultado(cambioTotal);
        const finalTxt=fmtCinematicaResultado(valorFinal);
        const duracionTxt=fmtCinematicaResultado(duracion);
        const opcionesBase={xInicio:a,xFin:b,etiquetaInicio:'t₁',etiquetaFin:'t₂',incluirCeroX:true,incluirCeroY:true,alto:450};
        let nombre='', pasos=[], bloques='', despues=()=>{}, extraDetalle='';

        if(tipo==='velocidad'){
            nombre='Velocidad desde aceleración';
            pasos=pasosCinematica([
                {titulo:'Regla aplicada', latex:String.raw`v(t)=v(t_1)+\text{acumulación de la aceleración}`, explicacion:'La velocidad se obtiene tomando la velocidad inicial y sumando el cambio producido por la aceleración durante el intervalo.'},
                {titulo:'Función usada', latex:String.raw`a(t)=${F.latex}`, explicacion:'Esta es la aceleración del automóvil; describe cómo cambia la velocidad en cada instante.'},
                {titulo:'Intervalo y dato inicial', latex:String.raw`t_1=${t1.toLatex()},\quad t_2=${t2.toLatex()},\quad v(t_1)=${C.toLatex()}`, explicacion:`Se analiza el movimiento durante ${duracionTxt} unidades de tiempo.`},
                {titulo:'Cambio acumulado de velocidad', latex:String.raw`\text{Cambio aproximado de velocidad: } ${cambioTxt}`, explicacion:'El área firmada bajo a(t) indica cuánto aumenta o disminuye la velocidad entre t₁ y t₂.'},
                {titulo:'Valor final interpretado', latex:String.raw`v(t_2)\approx ${finalTxt}`, explicacion:'Este valor aproxima la velocidad al final del intervalo usando integración numérica por trapecios.'}
            ]);
            bloques=crearBloquesGraficasCinematica([
                {id:'cin-grafica-1', titulo:'Aceleración del automóvil a(t)', descripcion:'La curva muestra la aceleración. El área sombreada es firmada: representa el cambio de velocidad acumulado.'},
                {id:'cin-grafica-2', titulo:'Velocidad obtenida desde a(t)', descripcion:'La curva inicia en la velocidad inicial indicada y cambia según la aceleración acumulada.'}
            ]);
            extraDetalle=bloqueDetalleCinematica('Resumen de la resolución',[
                ['Función usada',`a(t) = ${F.latex.replace(/\\operatorname\{sen\}/g,'sen').replace(/\\cos/g,'cos')}`],
                ['Interpretación física','La aceleración indica qué tan rápido cambia la velocidad.'],
                ['Intervalo',`Desde t₁ = ${t1.toPlain()} hasta t₂ = ${t2.toPlain()}.`],
                ['Operación aplicada','Se acumula la aceleración y se suma la velocidad inicial.'],
                ['Cambio aproximado de velocidad',cambioTxt],
                ['Resultado',`v(t₂) ≈ ${finalTxt}`]
            ]);
            despues=()=>{
                dibujarGraficaCinematica('cin-grafica-1','Aceleración',[{...datosSerieCinematica(muestras.xs,muestras.ys,'a(t)'), area:true}],'tiempo t','aceleración a(t)',{...opcionesBase,textoArea:'cambio de velocidad'});
                dibujarGraficaCinematica('cin-grafica-2','Velocidad',[datosSerieCinematica(muestras.xs,acumulado,'v(t)')],'tiempo t','velocidad v(t)',opcionesBase);
            };
        }else{
            nombre='Posición desde velocidad';
            pasos=pasosCinematica([
                {titulo:'Regla aplicada', latex:String.raw`x(t)=x(t_1)+\text{acumulación de la velocidad}`, explicacion:'La posición se obtiene tomando la posición inicial y sumando el desplazamiento generado por la velocidad.'},
                {titulo:'Función usada', latex:String.raw`v(t)=${F.latex}`, explicacion:'Esta es la velocidad del automóvil; describe cómo cambia la posición en cada instante.'},
                {titulo:'Intervalo y dato inicial', latex:String.raw`t_1=${t1.toLatex()},\quad t_2=${t2.toLatex()},\quad x(t_1)=${C.toLatex()}`, explicacion:`Se analiza el movimiento durante ${duracionTxt} unidades de tiempo.`},
                {titulo:'Cambio acumulado de posición', latex:String.raw`\text{Cambio aproximado de posición: } ${cambioTxt}`, explicacion:'El área firmada bajo v(t) indica el cambio neto de posición entre t₁ y t₂.'},
                {titulo:'Valor final interpretado', latex:String.raw`x(t_2)\approx ${finalTxt}`, explicacion:'Este valor aproxima la posición final del automóvil en el intervalo indicado.'}
            ]);
            bloques=crearBloquesGraficasCinematica([
                {id:'cin-grafica-1', titulo:'Velocidad del automóvil v(t)', descripcion:'La curva muestra la velocidad. El área sombreada es firmada: representa el cambio de posición.'},
                {id:'cin-grafica-2', titulo:'Posición obtenida desde v(t)', descripcion:'La curva inicia en la posición inicial indicada y cambia acumulando la velocidad.'}
            ]);
            extraDetalle=bloqueDetalleCinematica('Resumen de la resolución',[
                ['Función usada',`v(t) = ${F.latex.replace(/\\operatorname\{sen\}/g,'sen').replace(/\\cos/g,'cos')}`],
                ['Interpretación física','La velocidad indica qué tan rápido cambia la posición.'],
                ['Intervalo',`Desde t₁ = ${t1.toPlain()} hasta t₂ = ${t2.toPlain()}.`],
                ['Operación aplicada','Se acumula la velocidad y se suma la posición inicial.'],
                ['Cambio aproximado de posición',cambioTxt],
                ['Resultado',`x(t₂) ≈ ${finalTxt}`]
            ]);
            despues=()=>{
                dibujarGraficaCinematica('cin-grafica-1','Velocidad',[{...datosSerieCinematica(muestras.xs,muestras.ys,'v(t)'), area:true}],'tiempo t','velocidad v(t)',{...opcionesBase,textoArea:'cambio de posición'});
                dibujarGraficaCinematica('cin-grafica-2','Posición',[datosSerieCinematica(muestras.xs,acumulado,'x(t)')],'tiempo t','posición x(t)',opcionesBase);
            };
        }

        const resultadoLatex = tipo==='velocidad' ? String.raw`v(t_2)\approx ${finalTxt}` : String.raw`x(t_2)\approx ${finalTxt}`;
        const extra = `${bloqueAdvertencia('Resultado aproximado: las acumulaciones se calcularon con la regla del trapecio para mantener la gráfica y el valor numérico consistentes.')}${resultadoFinalHTML(resultadoLatex)}${extraDetalle}${bloques}`;
        mostrarPasos('resultado-cin',nombre,pasos,extra);
        despues();
    }catch(err){ mostrarError('resultado-cin',err.message); }
}

function calcularCinematicaDef(){
    try{
        const tipo=val('tipo-cin'), F=obtenerFuncionCin();
        const t1=parse('cin-t1','t_1'), t2=parse('cin-t2','t_2');
        const a=t1.toNumber(), b=t2.toNumber();
        if(b <= a) throw new Error('El tiempo final debe ser mayor que el tiempo inicial.');
        const duracion=b-a;
        const muestras=muestrasCinematica(F.f,a,b);
        const absVel=muestras.ys.map(y=>Math.abs(y));
        const desplAcum=integrarAcumuladaCinematica(muestras.xs,muestras.ys,0);
        const distAcum=integrarAcumuladaCinematica(muestras.xs,absVel,0);
        const opcionesBase={xInicio:a,xFin:b,etiquetaInicio:'t₁',etiquetaFin:'t₂',incluirCeroX:true,incluirCeroY:true,alto:450};
        const duracionTxt=fmtCinematicaResultado(duracion);
        let nombre='', resultadoLatex='', res=0, pasos=[], bloques='', despues=()=>{}, extraDetalle='';

        if(tipo==='desplazamiento'){
            nombre='Desplazamiento';
            res=trapecio(F.f,a,b,2000,false);
            const resTxt=fmtCinematicaResultado(res);
            resultadoLatex=String.raw`\text{Cambio aproximado de posición: } ${resTxt}`;
            pasos=pasosCinematica([
                {titulo:'Regla aplicada', latex:String.raw`\text{Cambio de posición} = \text{área firmada bajo }v(t)`, explicacion:'El desplazamiento se obtiene acumulando la velocidad con signo: lo que está sobre el eje suma y lo que está debajo resta.'},
                {titulo:'Función usada', latex:String.raw`v(t)=${F.latex}`, explicacion:'La función representa la velocidad del automóvil en el tiempo.'},
                {titulo:'Intervalo', latex:String.raw`t_1=${t1.toLatex()},\quad t_2=${t2.toLatex()}`, explicacion:`La duración del intervalo es ${duracionTxt}.`},
                {titulo:'Resultado aproximado', latex:resultadoLatex, explicacion:'El resultado puede ser positivo, negativo o cero porque mide cambio neto de posición, no recorrido total.'}
            ]);
            bloques=crearBloquesGraficasCinematica([
                {id:'cin-grafica-1', titulo:'Velocidad del automóvil v(t)', descripcion:'El área sombreada es firmada: sobre el eje X suma y bajo el eje X resta.'},
                {id:'cin-grafica-2', titulo:'Desplazamiento acumulado', descripcion:'Esta curva muestra cómo se acumula el cambio neto de posición desde t₁.'}
            ]);
            extraDetalle=bloqueDetalleCinematica('Resumen de la resolución',[
                ['Función usada',`v(t) = ${F.latex.replace(/\\operatorname\{sen\}/g,'sen').replace(/\\cos/g,'cos')}`],
                ['Qué representa','Velocidad del automóvil.'],
                ['Operación aplicada','Área firmada bajo la velocidad.'],
                ['Intervalo',`Desde t₁ = ${t1.toPlain()} hasta t₂ = ${t2.toPlain()}.`],
                ['Interpretación','Mide el cambio neto de posición; puede cancelarse si hay velocidades opuestas.'],
                ['Resultado',`Cambio aproximado de posición: ${resTxt}`]
            ]);
            despues=()=>{
                dibujarGraficaCinematica('cin-grafica-1','Velocidad',[{...datosSerieCinematica(muestras.xs,muestras.ys,'v(t)'), area:true}],'tiempo t','velocidad v(t)',{...opcionesBase,textoArea:'desplazamiento'});
                dibujarGraficaCinematica('cin-grafica-2','Desplazamiento acumulado',[datosSerieCinematica(muestras.xs,desplAcum,'desplazamiento acumulado')],'tiempo t','desplazamiento',opcionesBase);
            };
        }else if(tipo==='distancia'){
            nombre='Distancia recorrida';
            res=trapecio(F.f,a,b,2000,true);
            const resTxt=fmtCinematicaResultado(res);
            resultadoLatex=String.raw`\text{Distancia recorrida aproximada: } ${resTxt}`;
            pasos=pasosCinematica([
                {titulo:'Regla aplicada', latex:String.raw`\text{Distancia recorrida} = \text{área bajo la magnitud de la velocidad}`, explicacion:'La distancia recorrida acumula rapidez: las partes negativas de v(t) se cuentan como movimiento positivo.'},
                {titulo:'Función usada', latex:String.raw`v(t)=${F.latex}`, explicacion:'Primero se toma la magnitud de la velocidad para evitar cancelaciones.'},
                {titulo:'Intervalo', latex:String.raw`t_1=${t1.toLatex()},\quad t_2=${t2.toLatex()}`, explicacion:`La duración del intervalo es ${duracionTxt}.`},
                {titulo:'Resultado aproximado', latex:resultadoLatex, explicacion:'Este valor mide el recorrido total, por eso no se cancela cuando la velocidad cambia de signo.'}
            ]);
            bloques=crearBloquesGraficasCinematica([
                {id:'cin-grafica-1', titulo:'Rapidez del automóvil |v(t)|', descripcion:'Se grafica la magnitud de la velocidad para que toda el área cuente como distancia positiva.'},
                {id:'cin-grafica-2', titulo:'Distancia acumulada', descripcion:'La distancia acumulada no disminuye porque siempre se suma recorrido.'}
            ]);
            extraDetalle=bloqueDetalleCinematica('Resumen de la resolución',[
                ['Función usada',`|v(t)| a partir de v(t) = ${F.latex.replace(/\\operatorname\{sen\}/g,'sen').replace(/\\cos/g,'cos')}`],
                ['Qué representa','Rapidez o magnitud de la velocidad.'],
                ['Operación aplicada','Área positiva bajo la rapidez.'],
                ['Intervalo',`Desde t₁ = ${t1.toPlain()} hasta t₂ = ${t2.toPlain()}.`],
                ['Interpretación','Mide todo el camino recorrido, sin cancelar movimientos en sentido contrario.'],
                ['Resultado',`Distancia recorrida aproximada: ${resTxt}`]
            ]);
            despues=()=>{
                dibujarGraficaCinematica('cin-grafica-1','Rapidez',[{...datosSerieCinematica(muestras.xs,absVel,'|v(t)|'), area:true}],'tiempo t','rapidez |v(t)|',{...opcionesBase,textoArea:'distancia'});
                dibujarGraficaCinematica('cin-grafica-2','Distancia acumulada',[datosSerieCinematica(muestras.xs,distAcum,'distancia acumulada')],'tiempo t','distancia',opcionesBase);
            };
        }else if(tipo==='velmedia'){
            nombre='Velocidad media';
            const despl=trapecio(F.f,a,b,2000,false);
            res=despl/duracion;
            const desplTxt=fmtCinematicaResultado(despl);
            const resTxt=fmtCinematicaResultado(res);
            resultadoLatex=String.raw`\text{Velocidad media aproximada: } ${resTxt}`;
            pasos=pasosCinematica([
                {titulo:'Regla aplicada', latex:String.raw`v_{media}=\frac{\text{desplazamiento}}{\text{duración del intervalo}}`, explicacion:'La velocidad media reparte el desplazamiento neto entre el tiempo total.'},
                {titulo:'Función usada', latex:String.raw`v(t)=${F.latex}`, explicacion:'La velocidad se acumula con signo para obtener desplazamiento.'},
                {titulo:'Cambio aproximado de posición', latex:String.raw`\text{Cambio aproximado de posición: } ${desplTxt}`, explicacion:'Primero se calcula el área firmada bajo v(t).'},
                {titulo:'Resultado aproximado', latex:resultadoLatex, explicacion:`Después se divide el desplazamiento entre la duración ${duracionTxt}.`}
            ]);
            bloques=crearBloquesGraficasCinematica([
                {id:'cin-grafica-1', titulo:'Velocidad y velocidad media', descripcion:'La curva azul es v(t), el área sombreada da el desplazamiento y la línea punteada muestra la velocidad media.'},
                {id:'cin-grafica-2', titulo:'Desplazamiento acumulado', descripcion:'Esta curva permite ver cómo cambia el desplazamiento neto durante el intervalo.'}
            ]);
            extraDetalle=bloqueDetalleCinematica('Resumen de la resolución',[
                ['Función usada',`v(t) = ${F.latex.replace(/\\operatorname\{sen\}/g,'sen').replace(/\\cos/g,'cos')}`],
                ['Operación aplicada','Desplazamiento dividido entre duración.'],
                ['Duración',duracionTxt],
                ['Desplazamiento aproximado',desplTxt],
                ['Interpretación','Indica qué velocidad constante produciría el mismo cambio neto de posición.'],
                ['Resultado',`Velocidad media aproximada: ${resTxt}`]
            ]);
            despues=()=>{
                dibujarGraficaCinematica('cin-grafica-1','Velocidad media',[
                    {...datosSerieCinematica(muestras.xs,muestras.ys,'v(t)'), area:true},
                    {nombre:'velocidad media', puntos:constanteCinematica(muestras.xs,res), dashed:true}
                ],'tiempo t','velocidad v(t)',{...opcionesBase,textoArea:'desplazamiento'});
                dibujarGraficaCinematica('cin-grafica-2','Desplazamiento acumulado',[datosSerieCinematica(muestras.xs,desplAcum,'desplazamiento acumulado')],'tiempo t','desplazamiento',opcionesBase);
            };
        }else if(tipo==='rapmedia'){
            nombre='Rapidez media';
            const dist=trapecio(F.f,a,b,2000,true);
            res=dist/duracion;
            const distTxt=fmtCinematicaResultado(dist);
            const resTxt=fmtCinematicaResultado(res);
            resultadoLatex=String.raw`\text{Rapidez media aproximada: } ${resTxt}`;
            pasos=pasosCinematica([
                {titulo:'Regla aplicada', latex:String.raw`rapidez_{media}=\frac{\text{distancia recorrida}}{\text{duración del intervalo}}`, explicacion:'La rapidez media reparte la distancia total recorrida entre el tiempo total.'},
                {titulo:'Función usada', latex:String.raw`|v(t)|\text{ a partir de }v(t)=${F.latex}`, explicacion:'Se usa la magnitud de la velocidad para contar todo el recorrido como positivo.'},
                {titulo:'Distancia aproximada', latex:String.raw`\text{Distancia aproximada: } ${distTxt}`, explicacion:'Primero se calcula el área positiva bajo la rapidez.'},
                {titulo:'Resultado aproximado', latex:resultadoLatex, explicacion:`Después se divide la distancia entre la duración ${duracionTxt}.`}
            ]);
            bloques=crearBloquesGraficasCinematica([
                {id:'cin-grafica-1', titulo:'Rapidez y rapidez media', descripcion:'La curva azul es |v(t)|, el área sombreada da la distancia y la línea punteada muestra la rapidez media.'},
                {id:'cin-grafica-2', titulo:'Distancia acumulada', descripcion:'Esta curva crece con el recorrido total acumulado.'}
            ]);
            extraDetalle=bloqueDetalleCinematica('Resumen de la resolución',[
                ['Función usada',`|v(t)| a partir de v(t) = ${F.latex.replace(/\\operatorname\{sen\}/g,'sen').replace(/\\cos/g,'cos')}`],
                ['Operación aplicada','Distancia recorrida dividida entre duración.'],
                ['Duración',duracionTxt],
                ['Distancia aproximada',distTxt],
                ['Interpretación','Indica qué rapidez constante produciría el mismo recorrido total.'],
                ['Resultado',`Rapidez media aproximada: ${resTxt}`]
            ]);
            despues=()=>{
                dibujarGraficaCinematica('cin-grafica-1','Rapidez media',[
                    {...datosSerieCinematica(muestras.xs,absVel,'|v(t)|'), area:true},
                    {nombre:'rapidez media', puntos:constanteCinematica(muestras.xs,res), dashed:true}
                ],'tiempo t','rapidez |v(t)|',{...opcionesBase,textoArea:'distancia'});
                dibujarGraficaCinematica('cin-grafica-2','Distancia acumulada',[datosSerieCinematica(muestras.xs,distAcum,'distancia acumulada')],'tiempo t','distancia',opcionesBase);
            };
        }else{
            throw new Error('Selecciona un caso de cinemática válido.');
        }
        const extra = `${bloqueAdvertencia(advertenciaAproximacion(2000))}${resultadoFinalHTML(resultadoLatex)}${extraDetalle}${bloques}`;
        mostrarPasos('resultado-cin',nombre,pasos,extra);
        despues();
    }catch(err){ mostrarError('resultado-cin',err.message); }
}


function normalizarExpresionCinematica(expr){
    let s = String(expr || '').trim();
    if(!s) throw new Error('Escribe una función de velocidad. Ejemplo: t^2 - 4*t + 3.');
    // Permite escribir v(t)=... o f(t)=..., tomando solo la parte derecha.
    if(s.includes('=')) s = s.split('=').pop().trim();
    s = s.replace(/,/g,'.')
         .replace(/π/g,'pi')
         .replace(/−/g,'-')
         .replace(/\bsen\b/gi,'sin')
         .replace(/\blog\b/gi,'log')
         .replace(/\^/g,'**');
    // Multiplicación implícita común: 2t, 3sen(t), 2(t+1), t(t+1), )(.
    s = s.replace(/(\d|\)|t|x|pi)(?=(t|x|pi|sin|cos|tan|sqrt|log|exp|abs|\())/gi,'$1*');
    return s;
}
function expresionCinematicaParaBackend(expr){
    return normalizarExpresionCinematica(expr)
        .replace(/\bt\b/g,'x')
        .replace(/\*\*/g,'^')
        .replace(/\bsin\b/g,'sin')
        .replace(/\blog\b/g,'log');
}
function compilarFuncionCinematica(expr){
    const s = normalizarExpresionCinematica(expr);
    if(!/^[0-9txpie\.\+\-\*\/\(\)\s,a-z]+$/i.test(s)){
        throw new Error('La función contiene símbolos no permitidos. Usa t, números, +, -, *, /, ^, sqrt, sen, cos, tan, log, exp o abs.');
    }
    const permitidas = new Set(['t','x','pi','e','sin','cos','tan','sqrt','log','exp','abs','pow']);
    const palabras = s.match(/[a-zA-Z_]+/g) || [];
    for(const palabra of palabras){
        if(!permitidas.has(palabra.toLowerCase())){
            throw new Error(`No reconozco "${palabra}". Usa t, sen, cos, tan, sqrt, log, exp, abs, pi o e.`);
        }
    }
    let fn;
    try{
        fn = new Function('t', `
            const x=t;
            const pi=Math.PI, e=Math.E;
            const sin=Math.sin, cos=Math.cos, tan=Math.tan, sqrt=Math.sqrt;
            const log=Math.log, exp=Math.exp, abs=Math.abs, pow=Math.pow;
            return (${s});
        `);
    }catch(error){
        throw new Error('No pude interpretar la función. Revisa paréntesis y operadores. Ejemplo válido: t^2 - 4*t + 3.');
    }
    return (t)=>{
        const y = Number(fn(t));
        if(!Number.isFinite(y)) throw new Error(`La función no se puede evaluar correctamente en t=${fmtNum(t)}.`);
        return y;
    };
}
function textoEntradaCinematica(expr){
    return String(expr || '').trim().replace(/</g,'').replace(/>/g,'');
}
async function calcularCinematicaLibre(){
    try{
        limpiarResultado('resultado-cin');
        const caso = val('cin-caso') || 'resumen';
        const expr = val('cin-exp').trim();
        if(!expr) throw new Error('Escribe una función. Ejemplo: t^2 - 4*t + 3.');
        const t1 = parse('cin-t1','tiempo inicial t₁');
        const t2 = parse('cin-t2','tiempo final t₂');
        const a = t1.toNumber(), b = t2.toNumber();
        if(b <= a) throw new Error('El tiempo final t₂ debe ser mayor que el tiempo inicial t₁.');

        const f = compilarFuncionCinematica(expr);
        const muestras = muestrasCinematica(f,a,b,1400);
        const duracion = b-a;
        const desplazamiento = trapecio(f,a,b,2000,false);
        const distancia = trapecio(f,a,b,2000,true);
        const velocidadMedia = desplazamiento/duracion;
        const rapidezMedia = distancia/duracion;
        const absVel = muestras.ys.map(y=>Math.abs(y));
        const desplAcum = integrarAcumuladaCinematica(muestras.xs,muestras.ys,0);
        const distAcum = integrarAcumuladaCinematica(muestras.xs,absVel,0);
        const exprLimpia = textoEntradaCinematica(expr);
        const opcionesBase={xInicio:a,xFin:b,etiquetaInicio:'t₁',etiquetaFin:'t₂',incluirCeroX:true,incluirCeroY:true,alto:450};
        const duracionTxt = fmtCinematicaResultado(duracion);
        const desplTxt = fmtCinematicaResultado(desplazamiento);
        const distTxt = fmtCinematicaResultado(distancia);
        const velMediaTxt = fmtCinematicaResultado(velocidadMedia);
        const rapMediaTxt = fmtCinematicaResultado(rapidezMedia);

        let simbolico = '';
        try{
            const data = await pedirAPI('/api/integrales/automatica', {
                expresion: expresionCinematicaParaBackend(expr),
                limite_inferior: t1.toPlain(),
                limite_superior: t2.toPlain()
            });
            if(data && (data.resultado_latex || data.resultado)){
                simbolico = `<div class="resultado-final"><b>Integral calculada por el backend:</b><div class="paso-latex">\\[${data.resultado_latex || data.resultado}\\]</div></div>`;
            }
        }catch(errorBackend){
            simbolico = bloqueAdvertencia('La interpretación física y la gráfica sí se generaron. El backend simbólico no pudo dar una primitiva exacta para esta función, así que se muestran aproximaciones numéricas.');
        }

        let nombre = 'Cinemática: interpretación de una velocidad';
        let resultadoLatex = String.raw`\text{Desplazamiento}\approx ${desplTxt},\quad \text{Distancia}\approx ${distTxt}`;
        let pasos = [];
        let detalle = '';
        let bloques = '';
        let despues = ()=>{};

        if(caso === 'velocidad'){
            const c0 = parse('cin-c0','velocidad inicial v(t₁)');
            const acumulado = integrarAcumuladaCinematica(muestras.xs,muestras.ys,c0.toNumber());
            const final = c0.toNumber() + desplazamiento;
            const finalTxt = fmtCinematicaResultado(final);
            nombre = 'Velocidad desde aceleración';
            resultadoLatex = String.raw`v(t_2)\approx ${finalTxt}`;
            pasos = pasosCinematica([
                {titulo:'Idea física', latex:String.raw`a(t)\longrightarrow v(t)`, explicacion:'La aceleración indica cómo cambia la velocidad. Al acumularla en el tiempo se obtiene el cambio de velocidad.'},
                {titulo:'Función escrita por el usuario', latex:String.raw`a(t)=\text{${exprLimpia}}`, explicacion:'La función representa la aceleración del objeto.'},
                {titulo:'Dato inicial', latex:String.raw`v(t_1)=${c0.toLatex()},\quad t_1=${t1.toLatex()},\quad t_2=${t2.toLatex()}`, explicacion:'La velocidad inicial sirve como punto de arranque.'},
                {titulo:'Cambio acumulado de velocidad', latex:String.raw`\int_{t_1}^{t_2}a(t)\,dt\approx ${desplTxt}`, explicacion:'Esta área firmada bajo la aceleración indica cuánto cambia la velocidad.'},
                {titulo:'Velocidad final', latex:resultadoLatex, explicacion:'Se suma el cambio acumulado a la velocidad inicial.'}
            ]);
            detalle = bloqueDetalleCinematica('Lectura física del resultado',[
                ['Función ingresada',`a(t) = ${exprLimpia}`],
                ['Intervalo',`Desde t₁ = ${t1.toPlain()} hasta t₂ = ${t2.toPlain()}.`],
                ['Velocidad inicial',`v(t₁) = ${c0.toPlain()}`],
                ['Cambio aproximado de velocidad',desplTxt],
                ['Velocidad final aproximada',finalTxt]
            ]);
            bloques = crearBloquesGraficasCinematica([
                {id:'cin-grafica-1', titulo:'Aceleración a(t)', descripcion:'El área sombreada representa el cambio de velocidad acumulado.'},
                {id:'cin-grafica-2', titulo:'Velocidad obtenida', descripcion:'Esta curva inicia en v(t₁) y cambia acumulando la aceleración.'}
            ]);
            despues = ()=>{
                dibujarGraficaCinematica('cin-grafica-1','Aceleración',[{...datosSerieCinematica(muestras.xs,muestras.ys,'a(t)'), area:true}],'tiempo t','aceleración a(t)',{...opcionesBase,textoArea:'cambio de velocidad'});
                dibujarGraficaCinematica('cin-grafica-2','Velocidad',[datosSerieCinematica(muestras.xs,acumulado,'v(t)')],'tiempo t','velocidad v(t)',opcionesBase);
            };
        }else if(caso === 'posicion'){
            const c0 = parse('cin-c0','posición inicial x(t₁)');
            const acumulado = integrarAcumuladaCinematica(muestras.xs,muestras.ys,c0.toNumber());
            const final = c0.toNumber() + desplazamiento;
            const finalTxt = fmtCinematicaResultado(final);
            nombre = 'Posición desde velocidad';
            resultadoLatex = String.raw`x(t_2)\approx ${finalTxt}`;
            pasos = pasosCinematica([
                {titulo:'Idea física', latex:String.raw`v(t)\longrightarrow x(t)`, explicacion:'La velocidad indica cómo cambia la posición. Al acumularla se obtiene el cambio de posición.'},
                {titulo:'Función escrita por el usuario', latex:String.raw`v(t)=\text{${exprLimpia}}`, explicacion:'La función representa la velocidad del objeto.'},
                {titulo:'Dato inicial', latex:String.raw`x(t_1)=${c0.toLatex()},\quad t_1=${t1.toLatex()},\quad t_2=${t2.toLatex()}`, explicacion:'La posición inicial sirve como punto de arranque.'},
                {titulo:'Desplazamiento', latex:String.raw`\int_{t_1}^{t_2}v(t)\,dt\approx ${desplTxt}`, explicacion:'Esta área firmada bajo la velocidad indica el cambio neto de posición.'},
                {titulo:'Posición final', latex:resultadoLatex, explicacion:'Se suma el desplazamiento a la posición inicial.'}
            ]);
            detalle = bloqueDetalleCinematica('Lectura física del resultado',[
                ['Función ingresada',`v(t) = ${exprLimpia}`],
                ['Intervalo',`Desde t₁ = ${t1.toPlain()} hasta t₂ = ${t2.toPlain()}.`],
                ['Posición inicial',`x(t₁) = ${c0.toPlain()}`],
                ['Desplazamiento aproximado',desplTxt],
                ['Posición final aproximada',finalTxt]
            ]);
            bloques = crearBloquesGraficasCinematica([
                {id:'cin-grafica-1', titulo:'Velocidad v(t)', descripcion:'El área sombreada representa el desplazamiento.'},
                {id:'cin-grafica-2', titulo:'Posición obtenida', descripcion:'Esta curva inicia en x(t₁) y cambia acumulando la velocidad.'}
            ]);
            despues = ()=>{
                dibujarGraficaCinematica('cin-grafica-1','Velocidad',[{...datosSerieCinematica(muestras.xs,muestras.ys,'v(t)'), area:true}],'tiempo t','velocidad v(t)',{...opcionesBase,textoArea:'desplazamiento'});
                dibujarGraficaCinematica('cin-grafica-2','Posición',[datosSerieCinematica(muestras.xs,acumulado,'x(t)')],'tiempo t','posición x(t)',opcionesBase);
            };
        }else if(caso === 'desplazamiento'){
            nombre = 'Desplazamiento';
            resultadoLatex = String.raw`\text{Desplazamiento}\approx ${desplTxt}`;
            pasos = pasosCinematica([
                {titulo:'Idea física', latex:String.raw`\int_{t_1}^{t_2}v(t)\,dt`, explicacion:'El desplazamiento acumula la velocidad con signo.'},
                {titulo:'Función escrita por el usuario', latex:String.raw`v(t)=\text{${exprLimpia}}`, explicacion:'Esta es la velocidad que se analiza.'},
                {titulo:'Intervalo', latex:String.raw`t_1=${t1.toLatex()},\quad t_2=${t2.toLatex()}`, explicacion:`La duración del intervalo es ${duracionTxt}.`},
                {titulo:'Resultado aproximado', latex:resultadoLatex, explicacion:'Puede ser positivo, negativo o cero porque mide cambio neto.'}
            ]);
            detalle = bloqueDetalleCinematica('Lectura física del resultado',[
                ['Función ingresada',`v(t) = ${exprLimpia}`], ['Desplazamiento aproximado',desplTxt], ['Interpretación','Cambio neto de posición.']
            ]);
            bloques = crearBloquesGraficasCinematica([
                {id:'cin-grafica-1', titulo:'Velocidad v(t)', descripcion:'El área con signo es el desplazamiento.'},
                {id:'cin-grafica-2', titulo:'Desplazamiento acumulado', descripcion:'Muestra cómo cambia el desplazamiento desde t₁.'}
            ]);
            despues=()=>{
                dibujarGraficaCinematica('cin-grafica-1','Velocidad',[{...datosSerieCinematica(muestras.xs,muestras.ys,'v(t)'), area:true}],'tiempo t','velocidad v(t)',{...opcionesBase,textoArea:'desplazamiento'});
                dibujarGraficaCinematica('cin-grafica-2','Desplazamiento acumulado',[datosSerieCinematica(muestras.xs,desplAcum,'desplazamiento acumulado')],'tiempo t','desplazamiento',opcionesBase);
            };
        }else if(caso === 'distancia'){
            nombre = 'Distancia recorrida';
            resultadoLatex = String.raw`\text{Distancia recorrida}\approx ${distTxt}`;
            pasos = pasosCinematica([
                {titulo:'Idea física', latex:String.raw`\int_{t_1}^{t_2}|v(t)|\,dt`, explicacion:'La distancia acumula la rapidez para que el movimiento negativo no se cancele.'},
                {titulo:'Función escrita por el usuario', latex:String.raw`v(t)=\text{${exprLimpia}}`, explicacion:'Primero se toma la magnitud de esta velocidad.'},
                {titulo:'Intervalo', latex:String.raw`t_1=${t1.toLatex()},\quad t_2=${t2.toLatex()}`, explicacion:`La duración del intervalo es ${duracionTxt}.`},
                {titulo:'Resultado aproximado', latex:resultadoLatex, explicacion:'Siempre representa recorrido total acumulado.'}
            ]);
            detalle = bloqueDetalleCinematica('Lectura física del resultado',[
                ['Función ingresada',`v(t) = ${exprLimpia}`], ['Distancia aproximada',distTxt], ['Interpretación','Todo el camino recorrido.']
            ]);
            bloques = crearBloquesGraficasCinematica([
                {id:'cin-grafica-1', titulo:'Rapidez |v(t)|', descripcion:'El área positiva bajo esta curva es la distancia.'},
                {id:'cin-grafica-2', titulo:'Distancia acumulada', descripcion:'Esta curva siempre crece o se mantiene.'}
            ]);
            despues=()=>{
                dibujarGraficaCinematica('cin-grafica-1','Rapidez',[{...datosSerieCinematica(muestras.xs,absVel,'|v(t)|'), area:true}],'tiempo t','rapidez |v(t)|',{...opcionesBase,textoArea:'distancia'});
                dibujarGraficaCinematica('cin-grafica-2','Distancia acumulada',[datosSerieCinematica(muestras.xs,distAcum,'distancia acumulada')],'tiempo t','distancia',opcionesBase);
            };
        }else if(caso === 'velmedia'){
            nombre = 'Velocidad media';
            resultadoLatex = String.raw`v_{media}\approx ${velMediaTxt}`;
            pasos = pasosCinematica([
                {titulo:'Idea física', latex:String.raw`v_{media}=\frac{\text{desplazamiento}}{t_2-t_1}`, explicacion:'La velocidad media reparte el desplazamiento neto entre el tiempo total.'},
                {titulo:'Desplazamiento', latex:String.raw`\int_{t_1}^{t_2}v(t)\,dt\approx ${desplTxt}`, explicacion:'Primero se acumula la velocidad con signo.'},
                {titulo:'Resultado aproximado', latex:resultadoLatex, explicacion:`Después se divide entre la duración ${duracionTxt}.`}
            ]);
            detalle = bloqueDetalleCinematica('Lectura física del resultado',[
                ['Desplazamiento',desplTxt], ['Duración',duracionTxt], ['Velocidad media aproximada',velMediaTxt]
            ]);
            bloques = crearBloquesGraficasCinematica([
                {id:'cin-grafica-1', titulo:'Velocidad y velocidad media', descripcion:'La línea punteada representa la velocidad media.'},
                {id:'cin-grafica-2', titulo:'Desplazamiento acumulado', descripcion:'Permite ver cómo se acumula el cambio neto.'}
            ]);
            despues=()=>{
                dibujarGraficaCinematica('cin-grafica-1','Velocidad media',[{...datosSerieCinematica(muestras.xs,muestras.ys,'v(t)'), area:true},{nombre:'velocidad media', puntos:constanteCinematica(muestras.xs,velocidadMedia), dashed:true}],'tiempo t','velocidad v(t)',{...opcionesBase,textoArea:'desplazamiento'});
                dibujarGraficaCinematica('cin-grafica-2','Desplazamiento acumulado',[datosSerieCinematica(muestras.xs,desplAcum,'desplazamiento acumulado')],'tiempo t','desplazamiento',opcionesBase);
            };
        }else if(caso === 'rapmedia'){
            nombre = 'Rapidez media';
            resultadoLatex = String.raw`rapidez_{media}\approx ${rapMediaTxt}`;
            pasos = pasosCinematica([
                {titulo:'Idea física', latex:String.raw`rapidez_{media}=\frac{\text{distancia recorrida}}{t_2-t_1}`, explicacion:'La rapidez media reparte la distancia recorrida entre el tiempo total.'},
                {titulo:'Distancia recorrida', latex:String.raw`\int_{t_1}^{t_2}|v(t)|\,dt\approx ${distTxt}`, explicacion:'Primero se acumula la rapidez.'},
                {titulo:'Resultado aproximado', latex:resultadoLatex, explicacion:`Después se divide entre la duración ${duracionTxt}.`}
            ]);
            detalle = bloqueDetalleCinematica('Lectura física del resultado',[
                ['Distancia recorrida',distTxt], ['Duración',duracionTxt], ['Rapidez media aproximada',rapMediaTxt]
            ]);
            bloques = crearBloquesGraficasCinematica([
                {id:'cin-grafica-1', titulo:'Rapidez y rapidez media', descripcion:'La línea punteada representa la rapidez media.'},
                {id:'cin-grafica-2', titulo:'Distancia acumulada', descripcion:'Permite ver cómo se acumula el recorrido.'}
            ]);
            despues=()=>{
                dibujarGraficaCinematica('cin-grafica-1','Rapidez media',[{...datosSerieCinematica(muestras.xs,absVel,'|v(t)|'), area:true},{nombre:'rapidez media', puntos:constanteCinematica(muestras.xs,rapidezMedia), dashed:true}],'tiempo t','rapidez |v(t)|',{...opcionesBase,textoArea:'distancia'});
                dibujarGraficaCinematica('cin-grafica-2','Distancia acumulada',[datosSerieCinematica(muestras.xs,distAcum,'distancia acumulada')],'tiempo t','distancia',opcionesBase);
            };
        }else{
            pasos = pasosCinematica([
                {titulo:'Idea física', latex:String.raw`v(t)\longrightarrow\text{movimiento acumulado}`, explicacion:'La velocidad indica cómo cambia la posición. Integrarla permite medir acumulación.'},
                {titulo:'Función escrita por el usuario', latex:String.raw`v(t)=\text{${exprLimpia}}`, explicacion:'Esta es la velocidad que se graficará respecto al tiempo.'},
                {titulo:'Intervalo de observación', latex:String.raw`t_1=${t1.toLatex()},\quad t_2=${t2.toLatex()}`, explicacion:'Solo se analiza el movimiento dentro de estos dos tiempos.'},
                {titulo:'Desplazamiento', latex:String.raw`\int_{t_1}^{t_2}v(t)\,dt\approx ${desplTxt}`, explicacion:'Es el cambio neto de posición. Las partes negativas de la velocidad restan.'},
                {titulo:'Distancia recorrida', latex:String.raw`\int_{t_1}^{t_2}|v(t)|\,dt\approx ${distTxt}`, explicacion:'Cuenta todo el recorrido. Por eso se usa el valor absoluto de la velocidad.'}
            ]);
            detalle = bloqueDetalleCinematica('Lectura física del resultado',[
                ['Función ingresada',`v(t) = ${exprLimpia}`],
                ['Intervalo',`Desde t₁ = ${t1.toPlain()} hasta t₂ = ${t2.toPlain()}.`],
                ['Duración',duracionTxt],
                ['Desplazamiento aproximado',desplTxt],
                ['Distancia recorrida aproximada',distTxt],
                ['Velocidad media aproximada',velMediaTxt],
                ['Rapidez media aproximada',rapMediaTxt]
            ]);
            bloques = crearBloquesGraficasCinematica([
                {id:'cin-grafica-1', titulo:'Velocidad v(t)', descripcion:'El área sombreada con signo representa el desplazamiento: arriba del eje suma y abajo del eje resta.'},
                {id:'cin-grafica-2', titulo:'Distancia acumulada', descripcion:'Esta curva siempre aumenta porque acumula la rapidez |v(t)|, es decir, todo el recorrido.'}
            ]);
            despues=()=>{
                dibujarGraficaCinematica('cin-grafica-1','Velocidad',[{...datosSerieCinematica(muestras.xs,muestras.ys,'v(t)'), area:true}],'tiempo t','velocidad v(t)',{...opcionesBase,textoArea:'desplazamiento'});
                dibujarGraficaCinematica('cin-grafica-2','Distancia acumulada',[datosSerieCinematica(muestras.xs,distAcum,'distancia acumulada')],'tiempo t','distancia recorrida',opcionesBase);
            };
        }

        const extra = `${bloqueAdvertencia(advertenciaAproximacion(2000,'En cinemática se usa como apoyo visual para interpretar el movimiento.'))}${resultadoFinalHTML(resultadoLatex)}${simbolico}${detalle}${bloques}`;
        mostrarPasos('resultado-cin',nombre,pasos,extra);
        despues();
    }catch(err){ mostrarError('resultado-cin',err.message); }
}


function prepararBotonesPiEnCampos(root=document){
    const ids = new Set(['auto-a','auto-b','area-a','area-b','rie-p','rie-xi','dar-p','cin-t1','cin-t2','cin-c0']);
    (root || document).querySelectorAll('input[type="text"]').forEach(input=>{
        if(!input.id) return;
        const debe = ids.has(input.id) || input.dataset.maxDigits === '10';
        if(!debe) return;
        const campo = input.closest('.campo');
        if(!campo || campo.querySelector('.boton-pi-entrada')) return;
        const wrap = document.createElement('div');
        wrap.className = 'teclado-math teclado-pi boton-pi-entrada';
        wrap.innerHTML = `<button type="button" class="tecla-math" onclick="Calculadora.insertarMath('${input.id}','pi')">π</button><button type="button" class="tecla-math" onclick="Calculadora.insertarMath('${input.id}','e')">e</button><button type="button" class="tecla-math" onclick="Calculadora.insertarMath('${input.id}','phi')">φ</button>`;
        campo.appendChild(wrap);
    });
}
function actualizarCasoCinematica(){
    const caso = val('cin-caso') || 'resumen';
    const label = $('cin-exp-label');
    const ayuda = $('cin-caso-ayuda');
    const campoInicial = $('cin-c0-campo');
    const inputInicial = $('cin-c0');
    if(label){
        if(caso === 'velocidad') label.textContent = 'Función de aceleración a(t)';
        else label.textContent = 'Función de velocidad v(t)';
    }
    if(campoInicial){
        const usarInicial = caso === 'velocidad' || caso === 'posicion';
        campoInicial.style.display = usarInicial ? 'block' : 'none';
        if(inputInicial) inputInicial.placeholder = caso === 'velocidad' ? 'Ej. 0, pi/2' : 'Ej. 0, 5, pi';
    }
    if(ayuda){
        const textos = {
            resumen:'Muestra desplazamiento, distancia recorrida, velocidad media y rapidez media usando la misma función.',
            posicion:'Usa una velocidad v(t), una posición inicial x(t₁), y calcula la posición final x(t₂).',
            velocidad:'Usa una aceleración a(t), una velocidad inicial v(t₁), y calcula la velocidad final v(t₂).',
            desplazamiento:'Calcula el cambio neto de posición acumulando la velocidad con signo.',
            distancia:'Calcula el recorrido total acumulando la rapidez |v(t)|.',
            velmedia:'Calcula la velocidad media: desplazamiento dividido entre tiempo total.',
            rapmedia:'Calcula la rapidez media: distancia recorrida dividida entre tiempo total.'
        };
        ayuda.textContent = textos[caso] || textos.resumen;
    }
}

function init(){
    if($('form-indef')) renderIndefForm();
    if($('form-def')) renderDefForm();
    if($('form-metodo')) renderMetodoForm();
    if($('form-cin')) renderCinematicaForm();
    actualizarCasoCinematica();
    if($('area1-params')){ renderFuncionSelector('area1','area1'); renderFuncionSelector('area2','area2'); }
    if($('rie-params')) renderFuncionSelector('rie','riemann');
    if($('dar-params')) renderFuncionSelector('dar','darboux');
    prepararValidacionDigitos();
    prepararBotonesPiEnCampos();
    renderMath();
}

document.addEventListener('DOMContentLoaded', init);
window.Calculadora = {renderIndefForm, calcularIndefConstante, calcularIndefPotencia, calcularIndefPolinomio, calcularIndefTrig, calcularIndefLog, calcularIndefExp, toggleLogAx, addTerm, clearTerms, renderDefForm, calcularDefConstante, calcularDefPotencia, calcularDefPolinomio, calcularDefExponencial, calcularDefLogaritmica, calcularDefTrig, renderFuncionSelector, calcularArea, calcularRiemann, calcularDarboux, calcularAutomatica, abrirEsbozoIntegralDefinida, actualizarEsbozoIntegralDefinida, inicializarPaginaEsbozoIntegralDefinida, zoomEsbozoGrafica, resetEsbozoGrafica, renderMetodoForm, calcularCambioVariable, calcularPorPartes, calcularSustTrig, calcularFraccionesParciales, renderCinematicaForm, calcularCinematicaIndef, calcularCinematicaDef, calcularCinematicaLibre, insertarMath, actualizarVistaLatex, advertirLimiteDigitosEnCampo, prepararValidacionDigitos, prepararBotonesPiEnCampos, actualizarCasoCinematica};
})();

document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("lienzoCalculo");
    const slider = document.getElementById("sliderRectangulos");
    const textoN = document.getElementById("txt-n");

    if (!canvas || !slider) {
        return;
    }

    const ctx = canvas.getContext("2d");

    function funcion(x) {
        return 1.05 + 0.85 * Math.sin(0.75 * x - 0.7) + 0.035 * Math.pow(x - 6, 2);
    }

    function tick(x) {
        return Number(x.toFixed(1)).toString();
    }

    function dibujarEtiquetaPequena(texto, x, y, color) {
        ctx.save();
        ctx.font = "bold 13px Arial";
        const w = ctx.measureText(texto).width;
        ctx.fillStyle = "rgba(15,23,42,0.92)";
        ctx.fillRect(x - w / 2 - 6, y - 15, w + 12, 21);
        ctx.strokeStyle = "rgba(148,163,184,0.45)";
        ctx.strokeRect(x - w / 2 - 6, y - 15, w + 12, 21);
        ctx.fillStyle = color;
        ctx.fillText(texto, x - w / 2, y);
        ctx.restore();
    }

    function dibujarAnimacion(n) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const margenIzq = 76;
        const margenDer = 74;
        const margenSup = 34;
        const margenInf = 74;

        const anchoGrafica = canvas.width - margenIzq - margenDer;
        const altoGrafica = canvas.height - margenSup - margenInf;

        const xMin = 0;
        const xMax = 10;
        const muestras = 420;
        const puntos = [];
        for (let i = 0; i <= muestras; i++) {
            const x = xMin + (i / muestras) * (xMax - xMin);
            puntos.push({x, y: funcion(x)});
        }
        const yValores = puntos.map(p => p.y).concat([0]);
        let yMin = Math.min(...yValores);
        let yMax = Math.max(...yValores);
        const margenY = (yMax - yMin) * 0.18 || 1;
        yMin -= margenY;
        yMax += margenY;

        function xCanvas(x) {
            return margenIzq + ((x - xMin) / (xMax - xMin)) * anchoGrafica;
        }

        function yCanvas(y) {
            return margenSup + altoGrafica - ((y - yMin) / (yMax - yMin)) * altoGrafica;
        }

        ctx.fillStyle = "#030712";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 1;
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "12px Arial";
        for (let i = 0; i <= 5; i++) {
            const x = xMin + (xMax - xMin) * i / 5;
            const X = xCanvas(x);
            ctx.beginPath();
            ctx.moveTo(X, margenSup);
            ctx.lineTo(X, margenSup + altoGrafica);
            ctx.stroke();
            const xt = tick(x);
            const xtw = ctx.measureText(xt).width;
            ctx.fillText(xt, X - xtw / 2, margenSup + altoGrafica + 22);

            const y = yMin + (yMax - yMin) * i / 5;
            const Y = yCanvas(y);
            ctx.beginPath();
            ctx.moveTo(margenIzq, Y);
            ctx.lineTo(margenIzq + anchoGrafica, Y);
            ctx.stroke();
            ctx.fillText(tick(y), 12, Y + 4);
        }

        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 1.4;
        ctx.strokeRect(margenIzq, margenSup, anchoGrafica, altoGrafica);

        const ejeY0 = yCanvas(0);
        ctx.strokeStyle = "#f8fafc";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margenIzq, ejeY0);
        ctx.lineTo(margenIzq + anchoGrafica, ejeY0);
        ctx.stroke();

        const dx = (xMax - xMin) / n;
        for (let i = 0; i < n; i++) {
            const xIzq = xMin + i * dx;
            const xMedio = xIzq + dx / 2;
            const altura = funcion(xMedio);
            const X = xCanvas(xIzq);
            const Y = yCanvas(altura);
            const ancho = xCanvas(xIzq + dx) - X;
            const alto = Math.abs(ejeY0 - Y);
            const top = Math.min(ejeY0, Y);

            ctx.fillStyle = altura >= 0 ? "rgba(56, 189, 248, 0.32)" : "rgba(248, 113, 113, 0.28)";
            ctx.fillRect(X, top, ancho, alto);
            ctx.strokeStyle = "rgba(226, 232, 240, 0.55)";
            ctx.lineWidth = 1;
            ctx.strokeRect(X, top, ancho, alto);
        }

        ctx.save();
        ctx.beginPath();
        ctx.rect(margenIzq, margenSup, anchoGrafica, altoGrafica);
        ctx.clip();
        ctx.strokeStyle = "#fb7185";
        ctx.lineWidth = 4;
        ctx.beginPath();
        puntos.forEach((p, i) => {
            const X = xCanvas(p.x);
            const Y = yCanvas(p.y);
            if (i === 0) ctx.moveTo(X, Y);
            else ctx.lineTo(X, Y);
        });
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = "#e5e7eb";
        ctx.font = "bold 14px Arial";
        ctx.fillText("f(x)", margenIzq + 10, margenSup + 18);
        ctx.fillText("x", margenIzq + anchoGrafica + 28, margenSup + altoGrafica + 24);
        ctx.fillText("y", margenIzq - 28, margenSup + 14);

        ctx.fillStyle = "rgba(15,23,42,0.82)";
        ctx.fillRect(margenIzq + 14, margenSup + 32, 246, 54);
        ctx.strokeStyle = "rgba(148,163,184,0.35)";
        ctx.strokeRect(margenIzq + 14, margenSup + 32, 246, 54);
        ctx.fillStyle = "#bfdbfe";
        ctx.font = "bold 13px Arial";
        ctx.fillText("Área bajo la curva", margenIzq + 28, margenSup + 54);
        ctx.fillStyle = "#bbf7d0";
        ctx.fillText(`Integral definida con n = ${n}`, margenIzq + 28, margenSup + 76);

        dibujarEtiquetaPequena("a", xCanvas(xMin), margenSup + altoGrafica + 48, "#ddd6fe");
        dibujarEtiquetaPequena("b", xCanvas(xMax), margenSup + altoGrafica + 48, "#ddd6fe");
    }

    function actualizar() {
        const n = parseInt(slider.value, 10);
        if (textoN) textoN.textContent = n;
        dibujarAnimacion(n);
    }

    slider.addEventListener("input", actualizar);
    actualizar();
});
