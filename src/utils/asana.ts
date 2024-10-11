import * as cheerio from 'cheerio'

export function upsertLinksSection(html: string, newLink: string, sectionTitle: string): string {
    const $ = cheerio.load(html)
    const matchingHeaders = $(`:header:contains("${sectionTitle}")`)
    const sectionHeader = matchingHeaders.length
        ? matchingHeaders.first()
        : $('<h1></h1>').text(sectionTitle).appendTo('body')
    const linksInSection = sectionHeader.nextUntil(':header').find('a')
    const existingLinkHrefs = linksInSection.toArray().map((link) => $(link).attr('href'))

    // 새 링크 넣어야 할 때
    if (newLink && !existingLinkHrefs.includes(newLink)) {
        const list = sectionHeader.next('ul')
        if (!list.length) {
            sectionHeader.after('<ul></ul>')
        }
        sectionHeader.next('ul').append(`<li><a href="${newLink}">${newLink}</a></li>`)
    }
    return `<body>${$('body').html()}</body>`
}
