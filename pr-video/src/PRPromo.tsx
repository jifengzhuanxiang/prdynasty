import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  spring,
  useCurrentFrame,
  interpolate,
  Easing,
  staticFile,
} from "remotion";
import { C, FONT_DISPLAY, FONT_SANS } from "./tokens";
import { Sheen } from "./Sheen";

const FPS = 30;

const Center: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <AbsoluteFill
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: 64,
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

/* ---------------- S1 暗场光起 · 品牌浮现 ---------------- */
const S1: React.FC = () => {
  const sf = useCurrentFrame();
  const push = interpolate(sf, [0, 30], [1.12, 1.0], { extrapolateRight: "clamp" });
  const brand = spring({ frame: sf, fps: FPS, config: { damping: 14, stiffness: 140, mass: 0.8 } });
  const kO = interpolate(sf, [26, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const kY = interpolate(sf, [26, 42], [14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const qO = interpolate(sf, [42, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const qY = interpolate(sf, [42, 60], [22, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: C.wine }}>
      <AbsoluteFill
        style={{
          transform: `scale(${push})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 34,
        }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: C.rose,
            color: C.white,
            display: "grid",
            placeItems: "center",
            fontSize: 92,
            fontWeight: 900,
            letterSpacing: "-0.08em",
            fontFamily: FONT_SANS,
            transform: `scale(${brand})`,
            boxShadow: "0 26px 60px rgba(0,0,0,0.35)",
          }}
        >
          PR
        </div>
        <div
          style={{
            color: C.peach,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "0.18em",
            opacity: kO,
            transform: `translateY(${kY}px)`,
          }}
        >
          深大志联宣传部 · 2026 招新
        </div>
        <div
          style={{
            color: C.white,
            fontFamily: FONT_DISPLAY,
            fontSize: 62,
            fontWeight: 600,
            lineHeight: 1.4,
            letterSpacing: "-0.01em",
            maxWidth: 860,
            opacity: qO,
            transform: `translateY(${qY}px)`,
          }}
        >
          你的灵感，还停在草稿里吗？
        </div>
      </AbsoluteFill>
      <Sheen delay={8} duration={52} angle={-16} intensity={0.7} />
    </AbsoluteFill>
  );
};

/* ---------------- S2 主张逐行点亮 ---------------- */
const HeadlineLine: React.FC<{
  text: React.ReactNode;
  delay: number;
  sheenDelay: number;
}> = ({ text, delay, sheenDelay }) => {
  const sf = useCurrentFrame();
  const e = spring({ frame: sf - delay, fps: FPS, config: { damping: 15, stiffness: 130, mass: 0.9 } });
  const o = interpolate(sf, [delay, delay + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(sf, [delay, delay + 16], [26, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 18, padding: "4px 10px" }}>
      <div style={{ opacity: o, transform: `translateY(${y}px) scale(${0.96 + 0.04 * e})`, fontFamily: FONT_DISPLAY, fontSize: 76, fontWeight: 600, lineHeight: 1.28, letterSpacing: "-0.02em", color: C.wine }}>
        {text}
      </div>
      <Sheen delay={sheenDelay} duration={42} angle={-14} intensity={0.9} />
    </div>
  );
};

const S2: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Center style={{ gap: 6 }}>
        <div style={{ color: C.muted, fontSize: 20, fontWeight: 800, letterSpacing: "0.16em", marginBottom: 26 }}>
          SZU VOLUNTEERS · PUBLIC RELATIONS
        </div>
        <HeadlineLine text="把你的灵感，" delay={0} sheenDelay={4} />
        <HeadlineLine
          text={
            <>
              做成校园里<strong style={{ color: C.rose, fontWeight: 700 }}>真正发生的作品。</strong>
            </>
          }
          delay={16}
          sheenDelay={20}
        />
      </Center>
    </AbsoluteFill>
  );
};

/* ---------------- S3 三个分组 · 发牌入场 ---------------- */
const GROUPS = [
  { name: "摄影组", file: "team-photo.jpg", bg: C.blush, num: "01", fit: "适合喜欢观察、影像与现场感的你" },
  { name: "平面设计组", file: "team-design.jpg", bg: "#fff0dc", num: "02", fit: "适合喜欢排版、色彩与视觉创作的你" },
  { name: "公众号组", file: "team-wechat.jpg", bg: "#e9f4f4", num: "03", fit: "适合喜欢表达、讲故事与新媒体的你" },
];

const GroupCard: React.FC<{ g: (typeof GROUPS)[number]; i: number }> = ({ g, i }) => {
  const sf = useCurrentFrame();
  const start = i * 9;
  const e = spring({ frame: sf - start, fps: FPS, config: { damping: 13, stiffness: 120, mass: 0.9 } });
  const o = interpolate(sf, [start, start + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = (1 - e) * 90;
  const rot = (1 - e) * (i === 1 ? 3 : -3);
  return (
    <div style={{ opacity: o }}>
      <div
        style={{
          position: "relative",
          width: 940,
          height: 290,
          borderRadius: 26,
          background: g.bg,
          display: "flex",
          alignItems: "center",
          gap: 26,
          padding: 22,
          boxShadow: "0 18px 48px rgba(58,31,43,0.10)",
          transform: `translateY(${y}px) rotate(${rot}deg)`,
          overflow: "hidden",
        }}
      >
        <div style={{ width: 246, height: 246, borderRadius: 20, overflow: "hidden", flexShrink: 0, background: C.white }}>
          <Img src={staticFile("assets/" + g.file)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ flex: 1, textAlign: "left", paddingRight: 16 }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: C.white, color: C.roseDark, display: "grid", placeItems: "center", fontWeight: 900, fontSize: 18, marginBottom: 14, boxShadow: "0 8px 20px rgba(58,31,43,0.12)" }}>
            {g.num}
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 50, fontWeight: 600, color: C.wine, letterSpacing: "-0.02em", marginBottom: 12 }}>
            {g.name}
          </div>
          <div style={{ color: C.muted, fontSize: 22, fontWeight: 700 }}>{g.fit}</div>
        </div>
        <Sheen delay={start + 6} duration={40} angle={-14} intensity={0.85} />
      </div>
    </div>
  );
};

const S3: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.paperSoft }}>
      <Center style={{ gap: 22 }}>
        <div style={{ color: C.roseDark, fontSize: 24, fontWeight: 800, letterSpacing: "0.06em", marginBottom: 6 }}>
          摄影 · 平面设计 · 公众号
        </div>
        {GROUPS.map((g, i) => (
          <GroupCard key={g.num} g={g} i={i} />
        ))}
        <div style={{ color: C.muted, fontSize: 22, fontWeight: 700, marginTop: 6 }}>选一个你最想试的方向</div>
      </Center>
    </AbsoluteFill>
  );
};

/* ---------------- S4 真实作品 · 卡点蒙太奇 ---------------- */
const MONTAGE = [
  { file: "design-poster.jpg", cap: "留下真实作品" },
  { file: "first-meet-group.jpg", cap: "练习把想法落地" },
  { file: "shanwei.jpg", cap: "认识一起生活的人" },
  { file: "team-building.jpg", cap: "留下真实作品" },
  { file: "meeting.jpg", cap: "认识一起生活的人" },
];

const S4: React.FC = () => {
  const sf = useCurrentFrame();
  const slot = 30;
  return (
    <AbsoluteFill style={{ background: C.wine }}>
      {MONTAGE.map((m, i) => {
        const local = sf - i * slot;
        const o = interpolate(local, [0, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
          interpolate(local, [slot - 5, slot], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const scale = interpolate(local, [0, slot], [1.0, 1.08], { extrapolateRight: "clamp" });
        return (
          <AbsoluteFill key={m.file} style={{ opacity: o }}>
            <AbsoluteFill style={{ transform: `scale(${scale})` }}>
              <Img src={staticFile("assets/" + m.file)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </AbsoluteFill>
            <Sheen delay={2} duration={26} angle={-12} intensity={0.6} />
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 90,
          display: "flex",
        }}
      >
        <div
          style={{
            background: "rgba(58,31,43,0.55)",
            color: C.white,
            fontFamily: FONT_DISPLAY,
            fontSize: 48,
            fontWeight: 600,
            letterSpacing: "0.02em",
            padding: "16px 36px",
            borderRadius: 999,
            backdropFilter: "blur(6px)",
          }}
        >
          {MONTAGE[Math.min(MONTAGE.length - 1, Math.floor(sf / slot))].cap}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- S5 价值安抚 ---------------- */
const S5: React.FC = () => {
  const sf = useCurrentFrame();
  const o1 = interpolate(sf, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y1 = interpolate(sf, [0, 22], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o2 = interpolate(sf, [30, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Center style={{ gap: 28 }}>
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 18, padding: "4px 12px" }}>
          <div style={{ opacity: o1, transform: `translateY(${y1}px)`, fontFamily: FONT_DISPLAY, fontSize: 86, fontWeight: 600, color: C.wine, letterSpacing: "-0.02em" }}>
            你不必一开始就很会。
          </div>
          <Sheen delay={6} duration={44} angle={-14} intensity={0.85} />
        </div>
        <div style={{ opacity: o2, color: C.muted, fontSize: 30, fontWeight: 700, lineHeight: 1.7, maxWidth: 820 }}>
          愿意动手、愿意一起，就已经是很好的开始。
        </div>
      </Center>
    </AbsoluteFill>
  );
};

/* ---------------- S6 扫码 CTA ---------------- */
const S6: React.FC = () => {
  const sf = useCurrentFrame();
  const card = spring({ frame: sf - 6, fps: FPS, config: { damping: 16, stiffness: 120, mass: 0.9 } });
  const y = interpolate(sf, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (1 - card) * 140;
  const o = interpolate(sf, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const qO = interpolate(sf, [18, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: C.roseDark }}>
      <Center style={{ gap: 40 }}>
        <div style={{ opacity: o, color: C.white, fontFamily: FONT_DISPLAY, fontSize: 60, fontWeight: 600, lineHeight: 1.35, letterSpacing: "-0.01em", maxWidth: 880 }}>
          下一次被看见的故事，<br />也许由你来讲。
        </div>
        <div
          style={{
            position: "relative",
            width: 360,
            background: C.white,
            borderRadius: 24,
            padding: 22,
            transform: `translateY(${y}px)`,
            overflow: "hidden",
            boxShadow: "0 26px 70px rgba(0,0,0,0.30)",
          }}
        >
          <div style={{ opacity: qO }}>
            <Img src={staticFile("assets/recruitment-qr-2026-08-21.jpg")} style={{ width: "100%", height: "auto", borderRadius: 12 }} />
          </div>
          <div style={{ color: C.roseDark, fontWeight: 800, fontSize: 24, marginTop: 14 }}>微信扫码加入</div>
          <div style={{ color: C.muted, fontSize: 18, marginTop: 4 }}>8 月 28 日前有效</div>
          <Sheen delay={26} duration={38} angle={-12} intensity={0.95} />
        </div>
      </Center>
    </AbsoluteFill>
  );
};

/* ---------------- S7 品牌落版 ---------------- */
const S7: React.FC = () => {
  const sf = useCurrentFrame();
  const brand = spring({ frame: sf, fps: FPS, config: { damping: 15, stiffness: 130, mass: 0.8 } });
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Center style={{ gap: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, transform: `scale(${brand})` }}>
          <div style={{ width: 96, height: 96, borderRadius: "50%", background: C.rose, color: C.white, display: "grid", placeItems: "center", fontSize: 44, fontWeight: 900, letterSpacing: "-0.08em", fontFamily: FONT_SANS }}>
            PR
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 52, fontWeight: 600, color: C.wine, letterSpacing: "-0.02em" }}>深大志联宣传部</div>
            <div style={{ color: C.muted, fontSize: 18, fontWeight: 800, letterSpacing: "0.18em", marginTop: 4 }}>PUBLIC RELATIONS</div>
          </div>
        </div>
        <div style={{ color: C.roseDark, fontSize: 34, fontWeight: 800, letterSpacing: "0.04em" }}>把灵感，做成真的。→ 扫码加入</div>
        <div style={{ color: C.muted, fontSize: 22, fontWeight: 700 }}>#深大志联宣传部招新</div>
      </Center>
      <Sheen delay={10} duration={50} angle={-16} intensity={0.8} />
    </AbsoluteFill>
  );
};

/* ---------------- 合成 ---------------- */
export const PRPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Sequence from={0} durationInFrames={90}>
        <S1 />
      </Sequence>
      <Sequence from={90} durationInFrames={120}>
        <S2 />
      </Sequence>
      <Sequence from={210} durationInFrames={150}>
        <S3 />
      </Sequence>
      <Sequence from={360} durationInFrames={150}>
        <S4 />
      </Sequence>
      <Sequence from={510} durationInFrames={120}>
        <S5 />
      </Sequence>
      <Sequence from={630} durationInFrames={150}>
        <S6 />
      </Sequence>
      <Sequence from={780} durationInFrames={120}>
        <S7 />
      </Sequence>
    </AbsoluteFill>
  );
};
