import { StatsData } from "../components/Statistics";

export const statsData: StatsData = {
  likes: [
    { month: "Jan", count: 142 },
    { month: "Feb", count: 156 },
    { month: "Mar", count: 132 },
    { month: "Apr", count: 118 },
    { month: "May", count: 167 },
    { month: "Jun", count: 203 },
    { month: "Jul", count: 178 },
    { month: "Aug", count: 145 },
    { month: "Sep", count: 129 },
    { month: "Oct", count: 138 },
    { month: "Nov", count: 121 },
    { month: "Dec", count: 105 }
  ],
  comments: [
    { month: "Jan", count: 48 },
    { month: "Feb", count: 52 },
    { month: "Mar", count: 45 },
    { month: "Apr", count: 39 },
    { month: "May", count: 57 },
    { month: "Jun", count: 74 },
    { month: "Jul", count: 63 },
    { month: "Aug", count: 51 },
    { month: "Sep", count: 44 },
    { month: "Oct", count: 47 },
    { month: "Nov", count: 41 },
    { month: "Dec", count: 36 }
  ]
};

export const genStats: { title: string; stat: number; percent: number }[] = [
  { title: "Total Views", stat: 45678, percent: 20 },
  { title: "Total Likes", stat: 2405, percent: 30 },
  { title: "Total Comments", stat: 10353, percent: 15 },
];
