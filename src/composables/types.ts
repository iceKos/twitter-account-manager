export interface QueueRecord {
    id: string;
    status: string;
    user_id: string;
    tweet_id: string;
    username: string,
    name: string,
    loading: boolean;
    error_message: string;
    prompt: string;
    content: string;
}