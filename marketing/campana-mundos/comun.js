// FarmaGlass · campaña "4 farmacias, 4 mundos": símbolos compartidos, vista previa y modo de exportación.
//
//   pieza.html            → vista previa achicada a la ventana (los reels se ven animados)
//   pieza.html?export     → tamaño real, estado final (para el PNG y la portada del reel)
//   pieza.html?export&anim → tamaño real y animada (para grabar el reel cuadro por cuadro)

(function () {
    // Marcas de las 4 farmacias (forma y colores de la web) e íconos de trazo
    const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
        <symbol id="m-centro" viewBox="0 0 48 48"><path d="M6 45V24a18 18 0 0 1 36 0v21z" fill="#14284B"/><circle cx="39" cy="9" r="6" fill="#C9A227" stroke="#FBF6EA" stroke-width="2.5"/><text x="24" y="37" text-anchor="middle" font-size="22" font-family="DM Serif Display, Georgia, serif" fill="#fff">C</text></symbol>
        <symbol id="m-plaza" viewBox="0 0 48 48"><path d="M24 3c12 0 21 8 21 20 0 13-9 22-21 22S3 37 3 25C3 12 12 3 24 3z" fill="#C2185B"/><circle cx="39" cy="9" r="6" fill="#FFD23F" stroke="#FFF0F6" stroke-width="2.5"/><text x="24" y="32" text-anchor="middle" font-size="21" font-weight="900" font-family="Unbounded, Arial Black, sans-serif" fill="#fff">P</text></symbol>
        <symbol id="m-norte" viewBox="0 0 48 48"><path d="M24 2l19 11v22L24 46 5 35V13z" fill="#1F4FD8"/><circle cx="39" cy="9" r="6" fill="#FF7A2E" stroke="#EEF3FF" stroke-width="2.5"/><text x="24" y="32" text-anchor="middle" font-size="23" font-weight="800" font-style="italic" font-family="Barlow Condensed, Impact, sans-serif" fill="#fff">N</text></symbol>
        <symbol id="m-parque" viewBox="0 0 48 48"><path d="M4 44V24C4 12 12 4 24 4h20v20c0 12-8 20-20 20z" fill="#4E6B3D"/><circle cx="39" cy="9" r="6" fill="#B5532A" stroke="#F8F1E4" stroke-width="2.5"/><text x="24" y="32" text-anchor="middle" font-size="21" font-weight="700" font-family="Fredoka, Verdana, sans-serif" fill="#fff">P</text></symbol>
        <symbol id="i-cross" viewBox="0 0 24 24"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/></symbol>
        <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
        <symbol id="i-down" viewBox="0 0 24 24"><path d="M12 5v14M6 13l6 6 6-6"/></symbol>
        <symbol id="i-scissors" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/></symbol>
        <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12 5 5L20 7"/></symbol>
    </svg>`;
    document.body.insertAdjacentHTML('afterbegin', sprite);

    // Sello FarmaGlass: <span class="fg-sello" data-sello></span>
    document.querySelectorAll('[data-sello]').forEach(el => {
        el.innerHTML = '<i><svg viewBox="0 0 24 24"><use href="#i-cross"/></svg></i><span>Farma<b>Glass</b></span>';
    });

    const art = document.querySelector('.art');
    art.style.setProperty('--w', art.dataset.w + 'px');
    art.style.setProperty('--h', art.dataset.h + 'px');
    const stage = art.parentElement;
    stage.style.setProperty('--w', art.dataset.w + 'px');
    stage.style.setProperty('--h', art.dataset.h + 'px');

    const q = new URLSearchParams(location.search);
    if (q.has('export')) document.body.classList.add('export');
    if (!q.has('export') || q.has('anim')) art.classList.add('anim');

    function fit() {
        if (document.body.classList.contains('export')) return;
        const k = Math.min(innerWidth / art.dataset.w, innerHeight / art.dataset.h) * .96;
        document.documentElement.style.setProperty('--k', k);
    }
    fit();
    addEventListener('resize', fit);
})();
