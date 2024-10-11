const BASE_URL = 'https://app.asana.com/api/1.0'

async function apiRequest<T>(url: string, options: RequestInit) {
    const res = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${process.env.ASANA_PAT}`,
        },
    })
    const data: T = await res.json()
    return data
}

interface TaskWithHtmlNotesResponse {
    data: {
        gid: string
        html_notes: string
    }
}

export async function getTaskWithHtmlNotes(taskId: string) {
    const data = await apiRequest<TaskWithHtmlNotesResponse>(`/tasks/${taskId}?opt_fields=html_notes`, {
        method: 'GET',
    })
    return data
}

export async function updateTaskHtmlNotes(taskId: string, htmlNotes: string) {
    const data = await apiRequest<TaskWithHtmlNotesResponse>(`/tasks/${taskId}?opt_fields=html_notes`, {
        method: 'PUT',
        body: JSON.stringify({
            data: {
                gid: taskId,
                html_notes: htmlNotes,
            },
        }),
    })
    return data
}
