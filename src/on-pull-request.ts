import { getPullRequest } from './apis/github-api'
import { extractAsanaTasksFromMarkdown, extractRepository } from './utils/github'
import { getTask, updateTask } from './apis/asana-api'
import { upsertLinksSection } from './utils/asana'

const LINKS_SECTION_TITLE = '깃헙 링크'

function getCurrentPullRequest() {
    const owner = process.env.GITHUB_REPOSITORY_OWNER
    const repo = extractRepository(process.env.GITHUB_REPOSITORY)
    const pr_number = extractPullRequestNumber(process.env.GITHUB_REF)
    if (!pr_number) {
        throw new Error('Could not extract pull request number from GITHUB_REF')
    }
    return getPullRequest(owner, repo, pr_number)
}

export function extractPullRequestNumber(workflowRef: string): number | null {
    const pullRequestNumberMatch = workflowRef.match(/refs\/pull\/(\d+)\/merge/)
    return pullRequestNumberMatch ? parseInt(pullRequestNumberMatch[1], 10) : null
}

async function main() {
    console.log('process.env', process.env)
    const pr = await getCurrentPullRequest()
    const asanaTasks = extractAsanaTasksFromMarkdown(pr.body)
    for (const { taskId } of asanaTasks) {
        const task = await getTask(taskId, 'html_notes')
        const html_notes = upsertLinksSection(task.data.html_notes, pr.html_url, LINKS_SECTION_TITLE)
        await updateTask(taskId, {
            html_notes,
        })
    }
}

main()
