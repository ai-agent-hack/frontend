import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const spotsTool = createTool({
  id: 'spots',
  description: 'Search for spots with detailed information included in results',
  inputSchema: z.object({
    query: z.string().describe('Search query for spots'),
    location: z.string().optional().describe('Location to search in (optional)'),
  }),
  outputSchema: z.object({
    spots: z.array(z.object({
      id: z.string(),
      name: z.string(),
      address: z.string(),
      phone: z.string().optional(),
      website: z.string().optional(),
      rating: z.number().optional(),
      priceLevel: z.number().optional(),
      hours: z.array(z.string()).optional(),
      photos: z.array(z.string()).optional(),
      types: z.array(z.string()).optional(),
      description: z.string().optional(),
    })),
  }),
  execute: async ({ context: _ }) => {
    // TODO: Implement actual search functionality with detailed information
    const mockSpots = [
      {
        id: "shibuya_sky_1",
        name: "SHIBUYA SKY",
        address: "東京都渋谷区渋谷2-24-12 渋谷スカイ",
        phone: "03-4221-0229",
        website: "https://www.shibuya-sky.com/",
        rating: 4.3,
        priceLevel: 3,
        hours: ["平日: 10:00 - 22:30", "土日祝: 9:00 - 23:00"],
        photos: ["https://example.com/shibuya-sky1.jpg", "https://example.com/shibuya-sky2.jpg"],
        types: ["観光スポット", "展望台", "エンターテイメント"],
        description: "渋谷の街を一望できる屋上展望施設。東京の絶景を楽しめる人気スポット。"
      },
      {
        id: "takoyaki_daruma_2",
        name: "たこ焼き だるま 道頓堀店",
        address: "大阪府大阪市中央区道頓堀1-6-4",
        phone: "06-6211-1101",
        website: "https://takoyaki-daruma.jp/",
        rating: 4.5,
        priceLevel: 1,
        hours: ["毎日: 11:00 - 23:00"],
        photos: ["https://example.com/daruma1.jpg", "https://example.com/daruma2.jpg"],
        types: ["たこ焼き", "大阪グルメ", "レストラン"],
        description: "大阪名物のたこ焼きで有名な老舗店。道頓堀の観光と合わせて楽しめる。"
      },
      {
        id: "kinkakuji_3",
        name: "金閣寺（鹿苑寺）",
        address: "京都府京都市北区金閣寺町1",
        phone: "075-461-0013",
        website: "https://www.shokoku-ji.jp/kinkakuji/",
        rating: 4.6,
        priceLevel: 1,
        hours: ["毎日: 9:00 - 17:00"],
        photos: ["https://example.com/kinkaku1.jpg", "https://example.com/kinkaku2.jpg"],
        types: ["寺院", "世界遺産", "観光スポット", "歴史"],
        description: "京都を代表する金色に輝く美しい寺院。四季折々の景色が楽しめる世界遺産。"
      },
      {
        id: "ramen_ichiran_4",
        name: "一蘭 渋谷店",
        address: "東京都渋谷区渋谷1-22-7",
        phone: "03-3400-6251",
        website: "https://ichiran.co.jp/",
        rating: 4.1,
        priceLevel: 2,
        hours: ["24時間営業"],
        photos: ["https://example.com/ichiran1.jpg", "https://example.com/ichiran2.jpg"],
        types: ["ラーメン", "とんこつラーメン", "レストラン"],
        description: "博多とんこつラーメンの有名チェーン店。一人一人の好みに合わせてカスタマイズ可能。"
      },
      {
        id: "tokyo_station_5",
        name: "東京駅",
        address: "東京都千代田区丸の内1丁目",
        phone: "050-2016-1603",
        website: "https://www.tokyoinfo.com/",
        rating: 4.2,
        priceLevel: 2,
        hours: ["駅構内店舗により異なる"],
        photos: ["https://example.com/tokyo-station1.jpg", "https://example.com/tokyo-station2.jpg"],
        types: ["駅", "ショッピング", "グルメ", "観光スポット"],
        description: "日本の玄関口として知られる歴史ある駅。グルメやショッピングも充実。"
      },
      {
        id: "sengen_cafe_6",
        name: "浅草 カフェ千現",
        address: "東京都台東区浅草2-7-13",
        phone: "03-3841-6802",
        website: "https://sengen-cafe.jp/",
        rating: 4.4,
        priceLevel: 2,
        hours: ["火〜日: 8:00 - 18:00", "月曜定休"],
        photos: ["https://example.com/sengen1.jpg", "https://example.com/sengen2.jpg"],
        types: ["カフェ", "コーヒー", "和カフェ", "浅草グルメ"],
        description: "浅草の老舗カフェ。伝統的な雰囲気の中で美味しいコーヒーと和スイーツが楽しめる。"
      }
    ];
    
    // Return 3-4 random spots to simulate search results
    const shuffled = mockSpots.sort(() => 0.5 - Math.random());
    return { 
      spots: shuffled.slice(0, Math.min(4, mockSpots.length))
    };
  },
});