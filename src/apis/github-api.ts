import { Octokit } from '@octokit/rest'
import * as core from '@actions/core'

const GITHUB_TOKEN = core.getInput('github-token')

const octokit = new Octokit({
    auth: GITHUB_TOKEN,
})

export async function getPullRequest(owner: string, repo: string, pull_number: number) {
    try {
        const { data } = await octokit.pulls.get({
            owner,
            repo,
            pull_number,
        })
        return data
    } catch (error) {
        console.error(error)
        throw new Error('Failed to get pull request')
    }
}
