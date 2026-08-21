export type ImageAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type RecruitmentTheme = {
  meta: { eyebrow: string; season: string; status: string };
  hero: {
    titleLead: string;
    titleAccent: string;
    description: string;
    primaryAction: { label: string; href: "#join" };
    secondaryAction: { label: string; href: "#groups" };
    images: ImageAsset[];
  };
  groups: Array<{
    number: string;
    title: string;
    lead: string;
    lines: string[];
    fit: string;
    image: ImageAsset;
  }>;
  benefits: Array<{ number: string; title: string; description: string }>;
  stories: Array<{
    tag: string;
    title: string;
    description: string;
    image: ImageAsset;
  }>;
  faq: Array<{ question: string; answer: string }>;
  recruitment: {
    title: string;
    groupName: string;
    instruction: string;
    qr: ImageAsset;
    validity: string;
    fallback: string;
  };
};

export const recruitmentTheme: RecruitmentTheme = {
  meta: {
    eyebrow: "SZU VOLUNTEERS · PUBLIC RELATIONS",
    season: "2026 RECRUITMENT",
    status: "新成员招募中",
  },
  hero: {
    titleLead: "把你的灵感，",
    titleAccent: "做成校园里真正发生的作品。",
    description:
      "这里有人举起相机，有人从一张空白画布开始，也有人把故事写成推文。加入深大志联宣传部 PR，用文字、镜头与设计，让你的想法真实落地。",
    primaryAction: { label: "立即加入招新群", href: "#join" },
    secondaryAction: { label: "先看看三个分组", href: "#groups" },
    images: [
      {
        src: "/assets/hero-first-meet.jpg",
        alt: "深大志联宣传部成员合照",
        width: 1800,
        height: 1302,
      },
      {
        src: "/assets/flowers.jpg",
        alt: "鲜花义卖活动中的花束",
        width: 1800,
        height: 1350,
      },
    ],
  },
  groups: [
    {
      number: "01",
      title: "摄影组",
      lead: "在现场按下快门，也把后来会想念的瞬间留下。",
      lines: ["记录大会、义卖与部门日常", "完成照片筛选、整理与基础后期", "让真实的表情成为集体记忆"],
      fit: "适合喜欢观察、影像与现场感的你",
      image: {
        src: "/assets/team-photo.jpg",
        alt: "摄影组成员在校园活动现场合照",
        width: 1800,
        height: 1350,
      },
    },
    {
      number: "02",
      title: "平面设计组",
      lead: "从一张空白画布开始，把想法变成校园里真正出现的作品。",
      lines: ["设计海报、推送封面与活动物料", "建立清楚、有辨识度的视觉表达", "让创意从草稿完整走到落地"],
      fit: "适合喜欢排版、色彩与视觉创作的你",
      image: {
        src: "/assets/team-design.jpg",
        alt: "平面设计组的作品展示",
        width: 637,
        height: 900,
      },
    },
    {
      number: "03",
      title: "公众号组",
      lead: "从一个标题开始，把信息理清，也把值得停留的故事说出去。",
      lines: ["负责选题、采访、文案与校对", "完成公众号排版与内容整理", "让每一件值得知道的事被看见"],
      fit: "适合喜欢表达、讲故事与新媒体的你",
      image: {
        src: "/assets/team-wechat.jpg",
        alt: "公众号组成员的工作与日常",
        width: 1440,
        height: 1080,
      },
    },
  ],
  benefits: [
    {
      number: "01",
      title: "留下真实作品",
      description: "让想法不只停在草稿里，而是变成真正发布、出现和被看见的内容。",
    },
    {
      number: "02",
      title: "练习把想法落地",
      description: "从需求、构思到执行，在一次次真实任务里找到适合自己的工作方法。",
    },
    {
      number: "03",
      title: "积累协作经验",
      description: "和不同分组一起完成项目，学会沟通、回应反馈，也学会彼此补位。",
    },
    {
      number: "04",
      title: "认识一起生活的人",
      description: "工作之外还有聚餐、出游和合照，部门日常也是大学生活的一部分。",
    },
  ],
  stories: [
    {
      tag: "作品现场",
      title: "从想法到真正出现的海报",
      description: "平面设计组让活动拥有清楚、有辨识度的第一印象。",
      image: {
        src: "/assets/design-poster.jpg",
        alt: "宣传部设计的活动海报",
        width: 648,
        height: 900,
      },
    },
    {
      tag: "初遇 PR",
      title: "第一次见面，故事从这里开始",
      description: "有人举起相机，有人讨论文案，也有人先记住了彼此的名字。",
      image: {
        src: "/assets/first-meet-group.jpg",
        alt: "宣传部成员第一次见面的集体合照",
        width: 1800,
        height: 1350,
      },
    },
    {
      tag: "一起出发",
      title: "工作之外，也认真一起生活",
      description: "海风、晚霞和没有写进工作记录里的笑声，同样构成宣传部。",
      image: {
        src: "/assets/shanwei.jpg",
        alt: "宣传部成员汕尾出游时的海边合照",
        width: 1350,
        height: 1800,
      },
    },
    {
      tag: "团队日常",
      title: "把配合练成一种默契",
      description: "在一次次共同任务和活动里，我们逐渐知道如何相互接住。",
      image: {
        src: "/assets/team-building.jpg",
        alt: "宣传部成员参加团队活动",
        width: 1800,
        height: 1200,
      },
    },
    {
      tag: "准备时刻",
      title: "好作品，常常从一场讨论开始",
      description: "一起梳理信息、确认分工，把模糊的念头慢慢变成可执行的方案。",
      image: {
        src: "/assets/meeting.jpg",
        alt: "宣传部成员围坐讨论活动安排",
        width: 1800,
        height: 1350,
      },
    },
  ],
  faq: [
    {
      question: "没有作品或经验，也可以来吗？",
      answer:
        "可以先从兴趣和愿意尝试开始。我们更想看到你愿意观察、表达和学习；具体报名资格与筛选安排以招新群通知为准。",
    },
    {
      question: "我只对其中一个方向感兴趣，可以吗？",
      answer:
        "可以。摄影、平面设计和公众号各有不同的工作方式，你可以先选择最想了解的方向，也会在合作中接触其他分组。",
    },
    {
      question: "加入以后会做些什么？",
      answer:
        "你会接触校园活动中的真实任务，从内容构思、视觉制作到现场记录逐步参与。具体分工与节奏以实际项目和招新群通知为准。",
    },
  ],
  recruitment: {
    title: "下一次被看见的故事，也许由你来讲。",
    groupName: "26 志联宣传部招新群",
    instruction: "使用微信扫描二维码加入招新群，后续安排以群内通知为准。",
    qr: {
      src: "/assets/recruitment-qr-2026-08-19.jpg",
      alt: "26 志联宣传部招新群微信二维码",
      width: 939,
      height: 1455,
    },
    validity: "该二维码 8 月 19 日前有效",
    fallback: "重新进入页面后若二维码已更新，请以最新页面为准。",
  },
};
