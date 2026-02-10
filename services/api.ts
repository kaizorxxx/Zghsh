
import type {
    HomeResponse,
    DetailResponse,
    WatchResponse,
    ScheduleResponse,
    SearchResponse,
    BatchResponse,
    AnimeItem,
    AnimeDetail,
    StreamingServer,
    DownloadLink
} from '../types';

const BASE_URL = 'https://rgsordertracking.com/animekompi/endpoints';

// --- MOCK DATA GENERATORS (Fallback System) ---

// Using placehold.co for reliable loading instead of picsum (which often times out)
const getMockImage = (text: string, seed: number) => 
    `https://placehold.co/300x450/09090b/ef4444?text=${encodeURIComponent(text)}+${seed}`;

const getMockDetailImage = (text: string) => 
    `https://placehold.co/600x800/09090b/ef4444?text=${encodeURIComponent(text)}`;

const getMockAnimeItem = (i: number): AnimeItem => ({
    slug: `cyber-drama-${i}`,
    title: `Neon Dynasty: Chronicles ${i}`,
    thumbnail: getMockImage('NeonDynasty', i),
    image: getMockImage('NeonDynasty', i),
    type: 'TV',
    latest_episode: `${12 + i}`,
    episode: `${12 + i}`,
    release_time: `${i * 5} min ago`
});

const getMockDetail = (slug: string): AnimeDetail => ({
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    thumbnail: getMockDetailImage(slug),
    synopsis: "Signal intercepted. The primary database connection was severed, but this cached neural fragment remains. In a world where data is currency, this drama explores the depths of the digital void.",
    info: {
        status: "Ongoing",
        studio: "Sansekai Nodes",
        dirilis: "2077",
        durasi: "24 min",
        season: "Winter 2077",
        tipe: "TV",
        censor: "Censored",
        diposting_oleh: "System",
        diperbarui_pada: "Now",
        genres: ["Cyberpunk", "Sci-Fi", "Action", "Romance"]
    },
    episodes: Array.from({length: 12}, (_, i) => ({
        slug: `${slug}-episode-${i+1}`,
        episode: `${i+1}`,
        title: `Episode ${i+1}`,
        date: new Date().toISOString().split('T')[0]
    }))
});

const getMockWatchData = () => ({
    title: "Neural Stream Simulation",
    streaming_servers: [
        { name: "Backup Node Alpha", type: "HLS", url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
        { name: "Backup Node Beta", type: "MP4", url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }
    ] as StreamingServer[],
    download_links: [
        {
            quality: "1080p Neural",
            links: [
                { provider: "G-Drive", url: "#" },
                { provider: "Mega", url: "#" }
            ]
        }
    ] as DownloadLink[]
});

function getMockResponse<T>(endpoint: string, params?: Record<string, string>): any {
    console.warn(`[System] Connection Failed. Switching to Neural Backup for: ${endpoint}`);
    
    if (endpoint.includes('/home.php') || endpoint.includes('/batch.php') || endpoint.includes('/search.php')) {
        return {
            status: 'success',
            data: {
                page: 1,
                total_pages: 5,
                anime: Array.from({length: 12}, (_, i) => getMockAnimeItem(i))
            }
        };
    }

    if (endpoint.includes('/detail.php')) {
        return {
            status: 'success',
            data: getMockDetail(params?.slug || 'unknown')
        };
    }

    if (endpoint.includes('/watch.php')) {
        return {
            status: 'success',
            data: getMockWatchData()
        };
    }

    return { status: 'error', data: null, message: "No backup data available for this node." };
}

// --- MAIN FETCH FUNCTION ---

async function fetchAPI<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    try {
        const res = await fetch(url.toString());
        if (!res.ok) {
            throw new Error(`API Error: ${res.statusText}`);
        }
        const data = await res.json();
        if (!data) throw new Error("Empty Data Received");
        return data;
    } catch (err) {
        // Fallback to Mock Data on Error (CORS, Offline, Server Down)
        return getMockResponse<T>(endpoint, params);
    }
}

export async function getHome(page: number = 1): Promise<HomeResponse> {
    return fetchAPI<HomeResponse>('/home.php', { page: page.toString() });
}

export async function getDetail(slug: string): Promise<DetailResponse> {
    return fetchAPI<DetailResponse>('/detail.php', { slug });
}

export async function getWatch(slug: string): Promise<WatchResponse> {
    return fetchAPI<WatchResponse>('/watch.php', { slug });
}

export async function getSchedule(): Promise<ScheduleResponse> {
    return fetchAPI<ScheduleResponse>('/schedule.php');
}

export async function search(query: string, page: number = 1): Promise<SearchResponse> {
    return fetchAPI<SearchResponse>('/search.php', { q: query, page: page.toString() });
}

export async function getBatch(page: number = 1): Promise<BatchResponse> {
    return fetchAPI<BatchResponse>('/batch.php', { page: page.toString() });
}
