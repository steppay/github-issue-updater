import { getPullRequest } from './apis/github-api'
import { extractAsanaTasksFromMarkdown } from './utils/github'
import { getTaskWithHtmlNotes, updateTaskHtmlNotes } from './apis/asana-api'
import { upsertLinksSection } from './utils/asana'

const LINKS_SECTION_TITLE = '깃헙 링크'

function getCurrentPullRequest() {
    const owner = process.env.GITHUB_REPOSITORY_OWNER
    const repo = process.env.GITHUB_REPOSITORY
    const pr_number = process.env.GITHUB_PR_NUMBER
    return getPullRequest(owner, repo, parseInt(pr_number))
}

async function main() {
    const pr = await getCurrentPullRequest()
    const asanaTasks = extractAsanaTasksFromMarkdown(pr.body)
    for (const { taskId } of asanaTasks) {
        const task = await getTaskWithHtmlNotes(taskId)
        const html_notes = upsertLinksSection(task.data.html_notes, pr.html_url, LINKS_SECTION_TITLE)
        await updateTaskHtmlNotes(taskId, html_notes)
    }
}

main()
