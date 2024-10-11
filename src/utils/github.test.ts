import { extractAsanaTasksFromMarkdown } from './github'

describe('extractAsanaTasksFromMarkdown', () => {
    test('정확한 Asana 링크 규격만 찾는다.', () => {
        const markdown = `
            Here is an invalid Asana link: https://app.asana.com/invalid/123/456
            Valid task: https://app.asana.com/0/123456789/987654321
        `

        const expectedTasks = [
            {
                link: 'https://app.asana.com/0/123456789/987654321',
                projectId: '123456789',
                taskId: '987654321',
                action: 'link',
            },
        ]

        const result = extractAsanaTasksFromMarkdown(markdown)
        expect(result).toEqual(expectedTasks)
    })

    test('Asana 링크가 없으면 빈배열로 리턴한다.', () => {
        const markdown = `
            This markdown does not contain any Asana task links.
        `

        const result = extractAsanaTasksFromMarkdown(markdown)
        expect(result).toEqual([])
    })

    test('한줄에 여러 개의 Asana 테스크 링크가 있을 수 있다.', () => {
        const markdown = `
            Check these tasks: https://app.asana.com/0/123456789/987654321 https://app.asana.com/0/111111111/222222222
        `

        const expectedTasks = [
            {
                link: 'https://app.asana.com/0/123456789/987654321',
                projectId: '123456789',
                taskId: '987654321',
                action: 'link',
            },
            {
                link: 'https://app.asana.com/0/111111111/222222222',
                projectId: '111111111',
                taskId: '222222222',
                action: 'link',
            },
        ]

        const result = extractAsanaTasksFromMarkdown(markdown)
        expect(result).toEqual(expectedTasks)
    })

    test('액션 명세가 있는 경우 해당 액션으로 인식한다.', () => {
        const markdown = `
            Here are some Asana tasks:
            - https://app.asana.com/0/123456789/987654321 (resolve)
            - https://app.asana.com/0/123456789/987654321 (link)
        `

        const expectedActions = ['resolve', 'link']

        const result = extractAsanaTasksFromMarkdown(markdown)
        const resultActions = result.map((task) => task.action)
        expect(resultActions).toEqual(expectedActions)
    })

    test('별다른 액션 명세가 안보이면 `link` 로 인식한다.', () => {
        const markdown = `
            Here are some Asana tasks:
            - https://app.asana.com/0/123456789/987654321
            - https://app.asana.com/0/111111111/222222222
        `

        const expectedActions = ['link', 'link']
        const result = extractAsanaTasksFromMarkdown(markdown)
        const resultActions = result.map((task) => task.action)

        expect(resultActions).toEqual(expectedActions)
    })

    test('비슷한 단어가 있으면 근접한 액션으로 추정한다.', () => {
        const markdown = `
            Here are some Asana tasks:
            - https://app.asana.com/0/123456789/987654321 (resolve)
            - https://app.asana.com/0/123456789/987654321 (connected)
            - https://app.asana.com/0/123456789/987654321 (linked)
            - https://app.asana.com/0/123456789/987654321 (fixes)
            - https://app.asana.com/0/123456789/987654321 (completed)
            - https://app.asana.com/0/123456789/987654321 (해결)
        `

        const expectedActions = ['resolve', 'link', 'link', 'resolve', 'resolve', 'resolve']
        const result = extractAsanaTasksFromMarkdown(markdown)
        const resultActions = result.map((task) => task.action)
        expect(resultActions).toEqual(expectedActions)
    })

    test('링크 앞에 액션이 있어도 근접한 액션으로 추정한다.', () => {
        const markdown = `
            Here are some Asana tasks:
            - resolve https://app.asana.com/0/123456789/987654321
            - connected https://app.asana.com/0/123456789/987654321
            - linked https://app.asana.com/0/123456789/987654321
            - fixes https://app.asana.com/0/123456789/987654321
            - completed https://app.asana.com/0/123456789/987654321
            - 해결 https://app.asana.com/0/123456789/987654321
        `

        const expectedActions = ['resolve', 'link', 'link', 'resolve', 'resolve', 'resolve']
        const result = extractAsanaTasksFromMarkdown(markdown)
        const resultActions = result.map((task) => task.action)
        expect(resultActions).toEqual(expectedActions)
    })
})
