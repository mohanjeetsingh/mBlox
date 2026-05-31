export function renderDate(config, publishedDate) {
    if (!config.showDate) return '';
    const formattedDate = config.dateFormatter.format(new Date(publishedDate));
    return `<span class="small fw-lighter">${config.showAuthor ? ' &#8226; ' : ''} ${formattedDate}</span>`;
}
