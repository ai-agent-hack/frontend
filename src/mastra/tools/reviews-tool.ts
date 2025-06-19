import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const reviewsTool = createTool({
  id: 'reviews',
  description: 'Get reviews for a specific spot',
  inputSchema: z.object({
    placeId: z.string().describe('The place ID of the spot'),
    topK: z.number().default(5).describe('Number of top reviews to return'),
  }),
  outputSchema: z.object({
    reviews: z.array(z.object({
      id: z.string(),
      author: z.string(),
      rating: z.number(),
      text: z.string(),
      time: z.string(),
      relativeTime: z.string().optional(),
    })),
    totalReviews: z.number(),
    averageRating: z.number(),
  }),
  execute: async ({ context }) => {
    // TODO: Implement actual reviews functionality
    // Mock reviews data mapped by placeId
    const mockReviewsData = {
      "shibuya_sky_1": {
        reviews: [
          {
            id: "review_sky_1",
            author: "田中美咲",
            rating: 5,
            text: "渋谷の夜景が本当に美しかったです！特に夕暮れ時の景色は最高でした。少し料金は高めですが、その価値は十分にあります。",
            time: "2024-01-20T19:30:00Z",
            relativeTime: "1週間前"
          },
          {
            id: "review_sky_2",
            author: "鈴木一郎",
            rating: 4,
            text: "平日の夕方に行きましたが、意外と混んでいました。でも景色は素晴らしく、写真映えもします。",
            time: "2024-01-18T16:45:00Z",
            relativeTime: "1週間前"
          },
          {
            id: "review_sky_3",
            author: "佐々木えみ",
            rating: 4,
            text: "友達と一緒に行きました。インスタ映えする写真がたくさん撮れて大満足です。ただ、風が強い日は寒いので注意が必要です。",
            time: "2024-01-15T14:20:00Z",
            relativeTime: "2週間前"
          }
        ],
        totalReviews: 1247,
        averageRating: 4.3
      },
      "takoyaki_daruma_2": {
        reviews: [
          {
            id: "review_daruma_1",
            author: "大阪太郎",
            rating: 5,
            text: "やっぱりだるまのたこ焼きは最高！外はカリッと中はとろっとで、ソースとの相性も抜群です。道頓堀観光の際は必ず立ち寄ります。",
            time: "2024-01-22T13:15:00Z",
            relativeTime: "5日前"
          },
          {
            id: "review_daruma_2",
            author: "東京花子",
            rating: 4,
            text: "関東から来ました。本場のたこ焼きは格別ですね！行列ができていましたが、待つ価値ありました。",
            time: "2024-01-19T11:30:00Z",
            relativeTime: "1週間前"
          },
          {
            id: "review_daruma_3",
            author: "山本ゆかり",
            rating: 5,
            text: "大阪名物を味わうならここ！店員さんも気さくで、大阪らしいおもてなしを感じました。",
            time: "2024-01-16T20:45:00Z",
            relativeTime: "1週間前"
          }
        ],
        totalReviews: 3204,
        averageRating: 4.5
      },
      "kinkakuji_3": {
        reviews: [
          {
            id: "review_kinkaku_1",
            author: "京都好き",
            rating: 5,
            text: "何度訪れても美しい金閣寺。特に秋の紅葉の季節は絶景です。早朝に行くと観光客も少なくて静かに楽しめます。",
            time: "2024-01-21T09:00:00Z",
            relativeTime: "6日前"
          },
          {
            id: "review_kinkaku_2",
            author: "海外太郎",
            rating: 5,
            text: "外国人の友達を案内しました。金色に輝く建物に感動していました。日本の文化を感じられる素晴らしい場所です。",
            time: "2024-01-17T15:30:00Z",
            relativeTime: "1週間前"
          },
          {
            id: "review_kinkaku_3",
            author: "写真愛好家",
            rating: 4,
            text: "写真撮影が好きな方にはとてもおすすめです。ただし、人が多いので良いショットを撮るのに時間がかかります。",
            time: "2024-01-14T11:20:00Z",
            relativeTime: "2週間前"
          }
        ],
        totalReviews: 8934,
        averageRating: 4.6
      },
      "ramen_ichiran_4": {
        reviews: [
          {
            id: "review_ichiran_1",
            author: "ラーメン通",
            rating: 4,
            text: "一人で気軽に食べられるのが良いですね。とんこつラーメンは安定の美味しさです。カスタマイズできるのも嬉しいポイント。",
            time: "2024-01-23T21:00:00Z",
            relativeTime: "4日前"
          },
          {
            id: "review_ichiran_2",
            author: "サラリーマン",
            rating: 4,
            text: "深夜でも営業しているのが助かります。仕事帰りによく利用しています。味も毎回安定しています。",
            time: "2024-01-20T23:45:00Z",
            relativeTime: "1週間前"
          },
          {
            id: "review_ichiran_3",
            author: "学生A",
            rating: 3,
            text: "味は普通に美味しいですが、ちょっと値段が高めかな。でも一人でも入りやすい雰囲気は良いです。",
            time: "2024-01-18T19:15:00Z",
            relativeTime: "1週間前"
          }
        ],
        totalReviews: 567,
        averageRating: 4.1
      },
      "tokyo_station_5": {
        reviews: [
          {
            id: "review_station_1",
            author: "出張マン",
            rating: 4,
            text: "新幹線の乗り継ぎで利用。駅弁の種類が豊富で選ぶのが楽しいです。お土産も充実しています。",
            time: "2024-01-22T08:30:00Z",
            relativeTime: "5日前"
          },
          {
            id: "review_station_2",
            author: "旅行好き",
            rating: 4,
            text: "歴史ある駅舎が美しいです。駅構内も広くて、様々なお店があるので時間を潰すのに困りません。",
            time: "2024-01-19T16:00:00Z",
            relativeTime: "1週間前"
          },
          {
            id: "review_station_3",
            author: "グルメ探検家",
            rating: 5,
            text: "駅構内のレストラン街が充実していて、全国各地のグルメが楽しめます。特に駅弁は種類が豊富でおすすめです。",
            time: "2024-01-17T12:45:00Z",
            relativeTime: "1週間前"
          }
        ],
        totalReviews: 2156,
        averageRating: 4.2
      },
      "sengen_cafe_6": {
        reviews: [
          {
            id: "review_cafe_1",
            author: "カフェ巡り",
            rating: 5,
            text: "浅草の隠れ家的なカフェ。コーヒーの香りが素晴らしく、和スイーツも絶品です。落ち着いた雰囲気で読書にも最適。",
            time: "2024-01-21T14:30:00Z",
            relativeTime: "6日前"
          },
          {
            id: "review_cafe_2",
            author: "和カフェ愛好家",
            rating: 4,
            text: "伝統的な日本の雰囲気を味わえるカフェです。抹茶ラテとあんみつのセットがおすすめ。",
            time: "2024-01-18T10:15:00Z",
            relativeTime: "1週間前"
          },
          {
            id: "review_cafe_3",
            author: "観光客",
            rating: 4,
            text: "浅草寺の参拝後に立ち寄りました。疲れた体にコーヒーが染みわたって、ホッと一息つけました。",
            time: "2024-01-15T16:20:00Z",
            relativeTime: "2週間前"
          }
        ],
        totalReviews: 342,
        averageRating: 4.4
      }
    };

    const placeId = context.placeId;
    const topK = context.topK || 5;
    
    // Return mock data for the specific place or default data
    const placeData = mockReviewsData[placeId as keyof typeof mockReviewsData] || mockReviewsData["shibuya_sky_1"];
    
    return {
      reviews: placeData.reviews.slice(0, topK),
      totalReviews: placeData.totalReviews,
      averageRating: placeData.averageRating
    };
  },
});