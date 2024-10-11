// 실제로는 id 가 숫자로 되어 있지만, asana api 문서에서 string 으로 되어 있어서 string 으로 처리함
export interface AsanaTask {
    link: string
    projectId: string
    taskId: string
    action: 'resolve' | 'link'
}

function findClosestAction(actionString: string | undefined): 'resolve' | 'link' | null {
    if (!actionString) return null

    const actionMap: Record<string, 'resolve' | 'link'> = {
        resolve: 'resolve',
        fix: 'resolve',
        complete: 'resolve',
        해결: 'resolve',
        link: 'link',
        connect: 'link',
    }
    actionString = actionString.trim().toLowerCase()

    for (const key of Object.keys(actionMap)) {
        if (actionString.includes(key)) {
            return actionMap[key]
        }
    }

    return null
}

function containsAsanaTaskLink(line: string) {
    const regex = /https:\/\/app\.asana\.com\/0\/(\d+)\/(\d+)/
    return regex.test(line)
}

export function extractAsanaTasksFromMarkdown(markdown: string): AsanaTask[] {
    return markdown
        .split('\n')
        .filter(containsAsanaTaskLink)
        .reduce<AsanaTask[]>((acc, line) => {
            const matches = Array.from(line.matchAll(/https:\/\/app\.asana\.com\/0\/\d+\/\d+/g))
            const links = matches.map((match) => match[0])
            const action = findClosestAction(line) ?? 'link'

            const tasks = links.map((link) => {
                // links 는 정규식으로 검증되었기 때문에, matches 는 null 이 아님
                const matches = link.match(/https:\/\/app\.asana\.com\/0\/(\d+)\/(\d+)/)!
                const projectId = matches[1]
                const taskId = matches[2]

                return {
                    link,
                    projectId,
                    taskId,
                    action,
                }
            })

            return acc.concat(tasks)
        }, [])
}

export function extractRepository(fullrepo: string) {
    const [_, repo] = fullrepo.split('/')
    return repo
}
