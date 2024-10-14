import * as github from '@actions/github'
import * as exec from '@actions/exec'
import { getPullRequest } from './apis/github-api'
import { extractRepository, extractAsanaTasksFromMarkdown } from './utils/github'
import { getTask, updateTask } from './apis/asana-api'

const ASANA_DEPLOYMENT_ENVIRONMENT_FIELD_LABEL = '환경'

const beforeSha = github.context.payload.before
const afterSha = github.context.payload.after

async function getCommitMessages(beforeSha: string, afterSha: string): Promise<string> {
    const output = await exec.getExecOutput('git', ['log', `${beforeSha}..${afterSha}`, '--pretty=format:%s'])
    return output.stdout
}

function getBranchName() {
    const ref = github.context.ref
    const branchName = ref.replace('refs/heads/', '')
    return branchName
}

// TODO: 여러군데 쓰이면 유틸리티로 옮기기
function mapBranchNameToDeploymentEnvironment(branchName: string) {
    switch (branchName) {
        case 'develop':
            return 'Dev'
        case 'release':
            return 'Stg'
        case 'main':
        case 'master':
            return 'Prod'
    }
}

function unique<T>(array: T[]): T[] {
    return Array.from(new Set(array))
}

async function main() {
    const owner = process.env.GITHUB_REPOSITORY_OWNER
    const repo = extractRepository(process.env.GITHUB_REPOSITORY)
    const commitMessages = await getCommitMessages(beforeSha, afterSha)
    const prNumberRegex = /#\d+/g
    const prNumbers = (commitMessages.match(prNumberRegex) ?? [])
        .map((prNumber) => prNumber.replace('#', ''))
        .map((prNumber) => parseInt(prNumber, 10))
    for (const prNumber of prNumbers) {
        const pr = await getPullRequest(owner, repo, prNumber)
        const asanaResolvedTasks = extractAsanaTasksFromMarkdown(pr.body).filter((task) => task.action === 'resolve')
        console.log('Resolved tasks:', asanaResolvedTasks)

        // 해결된 테스크들은 완료된 것으로 변경하고(최초), 배포된 환경을 업데이트한다.
        const branchName = getBranchName()
        for (const { taskId } of asanaResolvedTasks) {
            const task = await getTask(taskId, 'custom_fields')
            await updateTask(taskId, {
                custom_fields: task.data.custom_fields
                    .filter((field) => field.resource_subtype === 'multi_enum')
                    .filter((field) => field.name === ASANA_DEPLOYMENT_ENVIRONMENT_FIELD_LABEL)
                    .reduce<Record<string, string[]>>((acc, field) => {
                        acc[field.gid] = unique([
                            ...field.multi_enum_values.map((value) => value.gid),
                            field.enum_options.find(
                                (option) => option.name === mapBranchNameToDeploymentEnvironment(branchName),
                            ).gid,
                        ])
                        return acc
                    }, {}),
                completed: true,
            })
        }
    }
}

main()
