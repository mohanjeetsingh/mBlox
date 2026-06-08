export function renderStageLayout(content, config) {
    const pxClass = config.blockType === 'v' ? '' : ` ${config.layout.px}`;
    return `<div id="carousel-${config.mBlockID}-st${config.stageID}" class="${config.blockType === 's' ? 'sFeature ' : ""}relative${pxClass}">${content}</div>`;
}
