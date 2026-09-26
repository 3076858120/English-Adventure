// 学校任务：网页只负责“搭桥”，不复制现实试卷，也不直接给答案。
// 每一张真实试卷对应一个 school task；以后新增试卷时继续往这里添加即可。

export const SCHOOL_TASKS = [
  {
    id: 'unit3-paper-1',
    title: 'Unit 3｜Animals and their homes',
    shortTitle: 'Unit 3 试卷①',
    icon: '🐾',
    color: '#6C8CF5',
    description: '先准备，再回到现实中的纸质试卷完成挑战。',
    paperNote: '网页不会放原卷，也不会告诉你原题答案。准备完成后，请拿出老师布置的纸质试卷。',
    bridge: [
      {
        id: 'words',
        title: '第一站：动物词汇准备',
        subtitle: '先把最重要的词认熟、听熟。',
        type: 'words',
        items: [
          { word: 'panda', cn: '大熊猫', emoji: '🐼' },
          { word: 'monkey', cn: '猴子', emoji: '🐒' },
          { word: 'elephant', cn: '大象', emoji: '🐘' },
          { word: 'polar bear', cn: '北极熊', emoji: '🐻‍❄️' },
        ],
      },
      {
        id: 'sentences',
        title: '第二站：看懂简单句子',
        subtitle: '先学会从句子里抓住“谁”和“怎么样”。',
        type: 'sentences',
        questions: [
          {
            prompt: 'The panda is black and white.',
            tip: 'black and white = 黑白相间',
            options: ['🐼 大熊猫', '🐒 猴子', '🐘 大象'],
            answer: 0,
          },
          {
            prompt: 'The monkey is climbing.',
            tip: 'climbing = 爬 / 正在爬',
            options: ['🐒 猴子', '🐘 大象', '🐻‍❄️ 北极熊'],
            answer: 0,
          },
          {
            prompt: 'The elephant has a long trunk.',
            tip: 'trunk = 象鼻',
            options: ['🐘 大象', '🐼 大熊猫', '🐒 猴子'],
            answer: 0,
          },
          {
            prompt: 'The polar bear lives in a cold place.',
            tip: 'cold place = 寒冷的地方',
            options: ['🐻‍❄️ 北极熊', '🐒 猴子', '🐘 大象'],
            answer: 0,
          },
        ],
      },
      {
        id: 'challenge',
        title: '第三站：小型能力挑战',
        subtitle: '这些不是原卷题，是用来检查你有没有准备好。',
        type: 'challenge',
        questions: [
          {
            prompt: 'Which animal is black and white?',
            options: ['🐼 panda', '🐒 monkey', '🐘 elephant'],
            answer: 0,
          },
          {
            prompt: 'Which animal has a long trunk?',
            options: ['🐘 elephant', '🐼 panda', '🐒 monkey'],
            answer: 0,
          },
          {
            prompt: 'Which word means “猴子”?',
            options: ['monkey', 'panda', 'elephant'],
            answer: 0,
          },
          {
            prompt: 'climbing means…',
            options: ['正在爬', '正在跑', '正在游泳'],
            answer: 0,
          },
          {
            prompt: 'polar bear means…',
            options: ['北极熊', '大象', '大熊猫'],
            answer: 0,
          },
        ],
      },
    ],
    reward: { coins: 20, xp: 30 },
  },
]

export function getSchoolTask(id) {
  return SCHOOL_TASKS.find((task) => task.id === id) || null
}
