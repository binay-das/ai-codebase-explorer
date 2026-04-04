export async function githubFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const GITHUB_API_URL = 'https://api.github.com';

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = path.startsWith('http') ? path : `${GITHUB_API_URL}${normalizedPath}`;

    let response: Response;

    try {
        response = await fetch(url, {
            ...options,
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                ...options?.headers,
            },
        });


    } catch (error) {
        throw new Error(`Network error: ${error instanceof Error ? error.message : 'Failed to reach GitHub API'}`);
    }


    if (!response.ok) {
        const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');

        if (response.status === 403 && rateLimitRemaining === '0') {
            throw new Error('GitHub API rate limit exceeded');
        }

        let errorMessage = `GitHub API request failed with status ${response.status}`;


        try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
                errorMessage = `GitHub API Error: ${errorData.message}`;
            }
        } catch {
        }

        throw new Error(errorMessage);
    }



    try {
        return (await response.json()) as T;
    } catch {
        throw new Error('Failed to parse GitHub API response as JSON');
    }
}
