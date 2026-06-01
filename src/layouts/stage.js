export function renderStageLayout(content, config) {
    const pxClass = config.blockType === 'v' ? '' : ' px-8 @lg:px-12';
    return `<div id="carousel-${config.mBlockID}-st${config.stageID}" class="overflow-hidden ${config.blockType === 's' ? ' sFeature' : ""} relative${pxClass}">${content}</div>`;
}
