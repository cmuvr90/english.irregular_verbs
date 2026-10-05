import { domMax } from "motion/react";

// Отдельный модуль, чтобы LazyMotion подгрузил фичи (layout-анимации,
// жесты, drag) асинхронно и они не попали в первый бандл страницы.
export default domMax;
