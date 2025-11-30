import { RefObject } from "react";

export const calculatePublishTime = (creationDate: string): { num: number, timeType: string } => {
    const now = new Date();
    const published = new Date(creationDate);
    const diffMs = now.getTime() - published.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return { num: seconds, timeType: "second" };
    if (minutes < 60) return { num: minutes, timeType: "minute" };
    if (hours < 24) return { num: hours, timeType: "hour" };
    if (days < 7) return { num: days, timeType: "day" };
    if (days < 30) return { num: Math.floor(days / 7), timeType: "week" };
    if (days < 365) return { num: Math.floor(days / 30), timeType: "month" };

    return { num: Math.floor(days / 365), timeType: 'year' };
};

export const mapEndings = (lCount: number, cCount: number): { likesEnding: string, commentEnding: string } => {
    let result = { likesEnding: "s", commentEnding: "s" };
    const likesCount = lCount;
    const commentsCount = cCount;

    const lastLikes = likesCount % 10;
    const lastTwoLikes = likesCount % 100;
    const lastComments = commentsCount % 10;
    const lastTwoComments = commentsCount % 100;

    if (lastTwoLikes >= 11 && lastTwoLikes <= 14) {
        result.likesEnding = "p2";
    } else {
        switch (lastLikes) {
            case 1:
                result.likesEnding = "s";
                break;
            case 2:
            case 3:
            case 4:
                result.likesEnding = "p1";
                break;
            default:
                result.likesEnding = "p2";
        }
    }

    if (lastTwoComments >= 11 && lastTwoComments <= 14) {
        result.commentEnding = "p2";
    } else {
        switch (lastComments) {
            case 1:
                result.commentEnding = "s";
                break;

            case 2:
            case 3:
            case 4:
                result.commentEnding = "p1";
                break;
            default:
                result.commentEnding = "p2";
        }
    }

    return result;
}

export const calculateHeight = (ref: RefObject<HTMLDivElement | null>, visible?: boolean) => {
    const element = ref.current;
    if (!element) return "0";
    return visible ? `${element.scrollHeight}px` : "0";
}