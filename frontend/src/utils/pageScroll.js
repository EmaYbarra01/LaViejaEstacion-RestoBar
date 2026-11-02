// En esta app el contenedor con scroll puede ser la ventana o el body
export const getScrollTop = () => Math.max(window.scrollY, document.body.scrollTop, document.documentElement.scrollTop);

export const scrollPageTo = (top) => {
    window.scrollTo({ top, behavior: 'smooth' });
    document.body.scrollTo({ top, behavior: 'smooth' });
};
