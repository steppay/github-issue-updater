import { upsertLinksSection } from './asana'

describe('upsertLinksSection', () => {
    test('title 과 같은 제목을 찾아서 링크를 추가합니다.', () => {
        const html = '<body><h1>My links</h1><h1>test</h1></body>'
        const links = 'https://app'
        const title = 'My links'
        const result = upsertLinksSection(html, links, title)

        expect(result).toContain('<h1>My links</h1><ul><li><a href="https://app">https://app</a></li></ul>')
    })

    test('title 과 같은 제목이 없으면 마지막에 타이틀을 추가하고 링크를 추가합니다.', () => {
        const html = '<body><h1>Hello</h1></body>'
        const links = 'https://app'
        const title = 'My links'
        const result = upsertLinksSection(html, links, title)

        expect(result).toContain('<h1>My links</h1><ul><li><a href="https://app">https://app</a></li></ul>')
    })

    test('link 가 비었으면 아무 일도 일어나지 않습니다.', () => {
        const html = '<body><h1>My links</h1></body>'
        const links = ''
        const title = 'My links'
        const result = upsertLinksSection(html, links, title)

        expect(result).toBe(html)
    })
})
