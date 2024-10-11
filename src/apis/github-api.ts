import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
})

export async function getPullRequest(owner: string, repo: string, pull_number: number) {
    const { data } = await octokit.pulls.get({
        owner,
        repo,
        pull_number,
    })
    return data
}
