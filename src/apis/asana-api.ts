import * as core from '@actions/core'

const BASE_URL = 'https://app.asana.com/api/1.0'
const ASANA_TOKEN = core.getInput('asana-token')

interface TaskDetailResponse {
    data: {
        gid: string
        html_notes?: string
        custom_fields?: CustomField[]
    }
}

// 모든 속성이 정의되어 있지 않습니다. 필요한 속성만 구조를 예측해서 정의했어요.
type CustomField = MultiEnumCustomField | OtherCustomField

interface CustomFieldBase {
    resource_subtype: string
    gid: string
    name: string
}

interface MultiEnum {
    gid: string
    name: string
    resource_type: string
    enabled: boolean
    color: string
}

interface MultiEnumCustomField extends CustomFieldBase {
    resource_subtype: 'multi_enum'
    enum_options?: MultiEnum[]
    multi_enum_values?: MultiEnum[]
}

interface OtherCustomField extends CustomFieldBase {
    resource_subtype: 'text' | 'enum' | 'number' | 'date' | 'people'
}

interface TaskUpdateRequest {
    data: {
        gid?: string
        html_notes?: string
        custom_fields?: {
            [gid: string]: string[]
        }
        completed?: boolean
    }
}

async function apiRequest<T>(url: string, options: RequestInit) {
    try {
        const res = await fetch(`${BASE_URL}${url}`, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${ASANA_TOKEN}`,
            },
        })
        const data: T = await res.json()
        return data
    } catch (error) {
        console.error(error)
        throw new Error('API request failed')
    }
}

export async function getTask(taskId: string, opt_fields: string) {
    const data = await apiRequest<TaskDetailResponse>(`/tasks/${taskId}?opt_fields=${opt_fields}`, {
        method: 'GET',
    })
    return data
}

export async function updateTask(taskId: string, payload: TaskUpdateRequest['data']) {
    const data = await apiRequest<TaskDetailResponse>(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({
            data: {
                gid: taskId,
                ...payload,
            },
        }),
    })
    return data
}

// export async function updateTaskWithCustomFields(taskId: string, customFields: CustomField[]) {
//     console.log(
//         'update customFields',
//         customFields,
//         customFields
//             .filter((field) => field.resource_subtype === 'multi_enum')
//             .reduce<Record<string, string>>((acc, field) => {
//                 if (field.name === '환경') {
//                     const gid = field.multi_enum_values[0].gid
//                     acc[field.gid] = gid
//                     return acc
//                 }
//                 return acc
//             }, {}),
//     )
//     const data = await apiRequest<TaskWithCustomFieldsResponse>(`/tasks/${taskId}?opt_fields=custom_fields`, {
//         method: 'PUT',
//         body: JSON.stringify({
//             data: {
//                 gid: taskId,
//                 custom_fields: customFields
//                     .filter((field) => field.resource_subtype === 'multi_enum')
//                     .reduce<Record<string, string[]>>((acc, field) => {
//                         if (field.name === '환경') {
//                             const gid = field.multi_enum_values[0].gid
//                             acc[field.gid] = [gid]
//                             return acc
//                         }
//                         return acc
//                     }, {}),
//             },
//         }),
//     })
//     return data
// }
