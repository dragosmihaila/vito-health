import { useState } from "react";
import DietChat from "./components/DietChat";

// ── Manuel's real calculated stats ─────────────────────────────────────────
// BMR (Mifflin-St Jeor male): 10×89 + 6.25×180 − 5×17 + 5 = 1935 kcal
// TDEE Work Day  (×1.725 construction): 3338 kcal  → target 3238 (−3%)
// TDEE Run Day   (×1.55 moderate):      2999 kcal  → target 2849 (−5%)
// TDEE Rest Day  (×1.375 light):        2661 kcal  → target 2395 (−10%)
// Protein: 2g × 89kg = 178g | Fat: 0.9g × 89kg = 80g | Carbs vary by day
// BMI: 89 / 1.80² = 27.5 (medium-heavy build, not overweight for frame)
// Birthday: 31 July 2026 → 58 days from 3 June

const PROFILE = {
  weight: 89, height: 180, age: 17, bmi: 27.5,
  bmr: 1935,
  tdee:  { work: 3338, run: 2999, rest: 2661 },
  goal:  { work: 3238, run: 2849, rest: 2395 },
  macros: {
    protein: 178,
    fat: 80,
    carbs: { work: 452, run: 354, rest: 241 },
  },
  daysTo18: 58,
};

const symptoms = [
  { id: "drained",    emoji: "😮‍💨", label: "Drained / No Energy" },
  { id: "stressed",   emoji: "😤", label: "Stressed / Anxious" },
  { id: "brain_fog",  emoji: "🌫️", label: "Brain Fog" },
  { id: "sore",       emoji: "💪", label: "Muscle Soreness" },
  { id: "bloated",    emoji: "😣", label: "Bloated / Digestive" },
  { id: "bad_sleep",  emoji: "😴", label: "Poor Sleep" },
  { id: "craving",    emoji: "🍫", label: "Junk Food Cravings" },
  { id: "low_mood",   emoji: "😔", label: "Low Mood / Sad" },
  { id: "overheated", emoji: "🥵", label: "Overheated / Sweating" },
  { id: "joint_pain", emoji: "🦵", label: "Joint / Back Pain" },
];

const rec = {
  drained: {
    fruits: ["Banana 🍌", "Watermelon 🍉", "Dates 🟤", "Mango 🥭"],
    supps:  ["B-Complex", "Iron", "CoQ10", "Electrolytes"],
    tip: "Construction burns B vitamins fast. Eat a banana before your shift and add a pinch of salt to your water bottle to replace what you sweat out. At 89kg you need at least 3.5L water on work days.",
    color: "#f59e0b",
  },
  stressed: {
    fruits: ["Blueberries 🫐", "Kiwi 🥝", "Orange 🍊", "Strawberries 🍓"],
    supps:  ["Ashwagandha KSM-66", "Magnesium Glycinate", "L-Theanine"],
    tip: "Physical labour raises cortisol heavily. Vitamin C from oranges lowers it. Ashwagandha at 17 is safe and studied — 300–600mg KSM-66 daily.",
    color: "#8b5cf6",
  },
  brain_fog: {
    fruits: ["Avocado 🥑", "Blueberries 🫐", "Mango 🥭", "Pomegranate 🔴"],
    supps:  ["Omega-3 (Fish Oil)", "Vitamin D3", "Lion's Mane"],
    tip: "Your brain is still developing at 17 — Omega-3 is critical. Dehydration from outdoor work is the #1 cause of brain fog. You need 3.5–4L water on work days at your size.",
    color: "#06b6d4",
  },
  sore: {
    fruits: ["Pineapple 🍍", "Tart Cherry 🍒", "Papaya 🍈"],
    supps:  ["Creatine Monohydrate 5g", "Magnesium 300mg", "Collagen + Vit C"],
    tip: "Running + construction = heavy muscle load. Pineapple bromelain reduces inflammation. Creatine replenishes ATP faster — start with 5g/day, no loading needed at your age.",
    color: "#ef4444",
  },
  bloated: {
    fruits: ["Papaya 🍈", "Pear 🍐", "Ginger 🫚"],
    supps:  ["Probiotics", "Digestive Enzymes", "Peppermint Oil"],
    tip: "Eating fast during work breaks causes bloating. At your calorie target (2400–3200 kcal) gut health is important. Chew slowly, add a probiotic, drink ginger tea in the evening.",
    color: "#10b981",
  },
  bad_sleep: {
    fruits: ["Tart Cherry 🍒", "Kiwi 🥝", "Banana 🍌"],
    supps:  ["Magnesium Glycinate 300mg", "Melatonin 0.5mg", "L-Theanine 200mg"],
    tip: "Muscle grows while you sleep — at 17 you need 8–9 hours minimum. Physical work makes this more important, not less. Magnesium before bed is the single best upgrade you can make.",
    color: "#6366f1",
  },
  craving: {
    fruits: ["Apple 🍎", "Mango 🥭", "Grapes 🍇"],
    supps:  ["Chromium Picolinate", "L-Glutamine", "Zinc"],
    tip: "Cravings on work days usually mean you're under-eating carbs. On construction days you need 450g+ carbs — eat rice, potatoes, bread freely. Don't fear carbs on active days.",
    color: "#f97316",
  },
  low_mood: {
    fruits: ["Banana 🍌", "Berries 🫐", "Avocado 🥑"],
    supps:  ["Vitamin D3 4000 IU", "Omega-3", "Zinc", "5-HTP 50mg"],
    tip: "Low mood at 17 often comes from low Vitamin D (very common) or poor sleep after physical days. Get morning sunlight. Zinc supports testosterone development at your age.",
    color: "#ec4899",
  },
  overheated: {
    fruits: ["Watermelon 🍉", "Cucumber 🥒", "Coconut water 🥥"],
    supps:  ["Electrolytes", "Magnesium", "Vitamin C"],
    tip: "At 89kg doing outdoor construction you lose 1–2L sweat per hour in heat. Drink 500ml water every hour minimum. After a hot shift: banana + pinch of salt + water immediately.",
    color: "#f97316",
  },
  joint_pain: {
    fruits: ["Pineapple 🍍", "Papaya 🍈", "Cherry 🍒"],
    supps:  ["Collagen Peptides + Vit C", "Omega-3", "Glucosamine", "Magnesium"],
    tip: "Carrying heavy materials stresses your spine, knees and hips. Collagen + Vitamin C is proven to strengthen tendons. Stretch your lower back and hips every morning before shifts.",
    color: "#ef4444",
  },
};

// Meals calibrated to Manuel's exact calorie/protein targets per day type
const weeklyPlan = [
  {
    day: "Mon", type: "work", focus: "Construction",
    activity: "Heavy physical labour ~8hrs",
    kcal: 3238, prot: 178, carb: 452, fat: 80,
    meals: [
      "3 eggs scrambled + oats 80g + milk + banana 🌅",
      "Rice 250g + chicken breast 200g + cucumber salad ☀️",
      "Bread 2 slices + tuna 150g + tomatoes (mid-shift snack) 🌤️",
      "Beef 180g + boiled potatoes 300g + broccoli 🌙",
      "Greek yogurt 200g + walnuts 30g (before bed) 🌑",
    ],
  },
  {
    day: "Tue", type: "run", focus: "Run + Upper Body",
    activity: "20–30 min run + push/pull workout",
    kcal: 2849, prot: 175, carb: 354, fat: 80,
    meals: [
      "Oats 90g + milk + 2 eggs + banana 🌅",
      "Tuna 160g + rice 200g + tomatoes ☀️",
      "Whey shake 35g + apple (post-run) 🌤️",
      "Chicken breast 200g + sweet potato 250g + salad 🌙",
    ],
  },
  {
    day: "Wed", type: "rest", focus: "Rest Day",
    activity: "Light walking, stretching, recovery",
    kcal: 2395, prot: 170, carb: 241, fat: 80,
    meals: [
      "3-egg omelette + veggies + 1 slice bread 🌅",
      "Lentil soup 300ml + chicken breast 150g ☀️",
      "Salmon 170g + asparagus + rice 150g 🌙",
    ],
  },
  {
    day: "Thu", type: "work", focus: "Construction",
    activity: "Heavy physical labour ~8hrs",
    kcal: 3238, prot: 178, carb: 452, fat: 80,
    meals: [
      "3 eggs + oats 80g + OJ 🌅",
      "Beef mince 160g + pasta 220g + tomato sauce ☀️",
      "Banana + almonds 40g (on-site snack) 🌤️",
      "Grilled chicken 200g + potatoes 280g + green beans 🌙",
      "Cottage cheese 150g + fruit (before bed) 🌑",
    ],
  },
  {
    day: "Fri", type: "run", focus: "Run + Legs/Core",
    activity: "20 min run + squat/deadlift/core session",
    kcal: 2849, prot: 175, carb: 354, fat: 80,
    meals: [
      "Peanut butter toast + banana + whey shake 🌅",
      "Rice 200g + chicken 200g + broccoli ☀️",
      "Beef 180g + roasted veggies + bread 🌙",
      "Kiwi + yogurt 150g (before sleep) 🌑",
    ],
  },
  {
    day: "Sat", type: "flex", focus: "Work or Active",
    activity: "Work site if needed — otherwise outdoor walk",
    kcal: 2849, prot: 175, carb: 354, fat: 80,
    meals: [
      "Oat pancakes + 2 eggs + fruit 🌅",
      "Chicken wrap 200g + salad ☀️",
      "Salmon 160g + rice 180g + cucumber 🌙",
      "Cottage cheese + berries (snack) 🌑",
    ],
  },
  {
    day: "Sun", type: "rest", focus: "Full Rest",
    activity: "Recovery — no training, light walk max",
    kcal: 2395, prot: 170, carb: 241, fat: 80,
    meals: [
      "Omelette 3 eggs + avocado + toast 🌅",
      "Chickpea salad + chicken 150g ☀️",
      "Lean beef 170g + roasted potatoes + veggies 🌙",
    ],
  },
];

const typeStyle = {
  work: { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.35)",   text: "#f87171",  label: "🏗️ Work Day" },
  run:  { bg: "rgba(34,211,238,0.10)",  border: "rgba(34,211,238,0.3)",   text: "#22d3ee",  label: "🏃 Training" },
  rest: { bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.25)", text: "#64748b",  label: "😴 Rest" },
  flex: { bg: "rgba(234,179,8,0.10)",   border: "rgba(234,179,8,0.25)",   text: "#fbbf24",  label: "⚡ Flexible" },
};

const tabs = ["🏠 Stats", "🩺 How I Feel", "📅 Week Plan", "💊 Supplements"];

export default function VitaFlow() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [showRec, setShowRec] = useState(false);
  const [dayType, setDayType] = useState("work");

  const currentRec = selectedSymptom ? rec[selectedSymptom] : null;

  const dayGoals = {
    work: { kcal: PROFILE.goal.work, carb: PROFILE.macros.carbs.work },
    run:  { kcal: PROFILE.goal.run,  carb: PROFILE.macros.carbs.run  },
    rest: { kcal: PROFILE.goal.rest, carb: PROFILE.macros.carbs.rest },
  };

  function showRecommendations() {
    setShowRec(true);
  }

  function selectSymptom(id) {
    setSelectedSymptom(id);
    setShowRec(false);
  }

  const selectedSymptomLabel = selectedSymptom
    ? symptoms.find((s) => s.id === selectedSymptom)?.label
    : null;

  const bg = "linear-gradient(160deg,#0b0b16 0%,#111827 60%,#0c1a1f 100%)";

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Segoe UI',system-ui,sans-serif", color: "#e2e8f0" }}>

      {/* ── HEADER ── */}
      <div style={{
        background: "rgba(255,255,255,0.025)", borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "16px 20px", display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11,
          background: "linear-gradient(135deg,#22d3ee,#6366f1)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>⚡</div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.6px" }}>VitaFlow</div>
          <div style={{ fontSize: 11, color: "#475569" }}>Personalized for Manuel · 17 y.o. · 89 kg · 1.80 m</div>
        </div>
        <div style={{
          marginLeft: "auto", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "#818cf8", fontWeight: 700,
        }}>🎂 {PROFILE.daysTo18}d to 18</div>
      </div>

      {/* ── TABS ── */}
      <div style={{
        display: "flex", overflowX: "auto", padding: "10px 14px 0", gap: 4,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{
            padding: "8px 13px", borderRadius: "8px 8px 0 0", border: "none", cursor: "pointer",
            whiteSpace: "nowrap", fontSize: 12, fontWeight: 700,
            background: activeTab === i ? "rgba(99,102,241,0.18)" : "transparent",
            color: activeTab === i ? "#818cf8" : "#475569",
            borderBottom: activeTab === i ? "2px solid #6366f1" : "2px solid transparent",
            transition: "all 0.18s",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "18px 16px", maxWidth: 500, margin: "0 auto" }}>

        {/* ══════════════════════════════════════════════
            TAB 0 — STATS DASHBOARD
        ══════════════════════════════════════════════ */}
        {activeTab === 0 && (
          <div>
            {/* Profile card */}
            <div style={{
              background: "linear-gradient(135deg,rgba(99,102,241,0.14),rgba(34,211,238,0.07))",
              border: "1px solid rgba(99,102,241,0.22)", borderRadius: 18, padding: 18, marginBottom: 16,
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
                <div style={{
                  width: 54, height: 54, borderRadius: 14,
                  background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 28,
                }}>👤</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>Manuel</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>17 y.o. · Medium build male</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>89 kg · 1.80 m · BMI {PROFILE.bmi}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { label: "BMR", val: "1,935", sub: "kcal/day base", icon: "🔥" },
                  { label: "Protein", val: "178g", sub: "daily target", icon: "🥩" },
                  { label: "BMI", val: "27.5", sub: "medium frame", icon: "📊" },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: "rgba(0,0,0,0.25)", borderRadius: 12, padding: "12px 8px", textAlign: "center",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{s.val}</div>
                    <div style={{ fontSize: 9, color: "#475569", marginTop: 1 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Day type selector */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 8 }}>SELECT TODAY'S DAY TYPE</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { id: "work", label: "🏗️ Work Day", desc: "3,238 kcal" },
                  { id: "run",  label: "🏃 Run Day",  desc: "2,849 kcal" },
                  { id: "rest", label: "😴 Rest Day", desc: "2,395 kcal" },
                ].map(d => (
                  <button key={d.id} onClick={() => setDayType(d.id)} style={{
                    flex: 1, padding: "10px 6px", borderRadius: 12, border: "none", cursor: "pointer",
                    background: dayType === d.id ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.04)",
                    outline: dayType === d.id ? "1.5px solid #6366f1" : "1px solid rgba(255,255,255,0.08)",
                    transition: "all 0.2s", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: dayType === d.id ? "#818cf8" : "#64748b" }}>{d.label}</div>
                    <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Macro targets */}
            <div style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: 16, marginBottom: 14,
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
                {dayType === "work" ? "🏗️ Work Day" : dayType === "run" ? "🏃 Run Day" : "😴 Rest Day"} — Today's Macro Targets
              </div>
              {[
                { label: "Calories", val: `${dayGoals[dayType].kcal.toLocaleString()} kcal`, pct: dayType === "work" ? 1 : dayType === "run" ? 0.88 : 0.74, color: "#f59e0b" },
                { label: "Protein",  val: "178 g",   pct: 1,    color: "#ef4444" },
                { label: "Carbs",    val: `${dayGoals[dayType].carb} g`, pct: dayType === "work" ? 1 : dayType === "run" ? 0.78 : 0.53, color: "#22d3ee" },
                { label: "Fat",      val: "80 g",    pct: 1,    color: "#8b5cf6" },
              ].map((m, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{m.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{m.val}</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ width: `${m.pct * 100}%`, height: "100%", background: m.color, borderRadius: 10, transition: "width 0.5s" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Goal explanation */}
            <div style={{
              background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.18)",
              borderRadius: 16, padding: 16, marginBottom: 14,
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>🎯 Your Recomposition Strategy</div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.75 }}>
                • <b style={{color:"#e2e8f0"}}>Work days</b> — eat near maintenance (~3,238 kcal). Your body needs fuel for labour AND muscle repair<br/>
                • <b style={{color:"#e2e8f0"}}>Run days</b> — slight deficit (~2,849 kcal). Cardio burns extra, no need to overeat<br/>
                • <b style={{color:"#e2e8f0"}}>Rest days</b> — clear deficit (~2,395 kcal). Less output, less input<br/>
                • <b style={{color:"#e2e8f0"}}>Protein stays at 178g every single day</b> — this is what protects and builds muscle
              </div>
            </div>

            {/* TDEE table */}
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, padding: 16,
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>📊 Your TDEE by Day Type</div>
              {[
                { label: "🏗️ Construction day", tdee: "3,338", goal: "3,238", deficit: "−100" },
                { label: "🏃 Running/gym day",   tdee: "2,999", goal: "2,849", deficit: "−150" },
                { label: "😴 Rest day",           tdee: "2,661", goal: "2,395", deficit: "−266" },
              ].map((r, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 0", borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  fontSize: 11,
                }}>
                  <span style={{ color: "#94a3b8", flex: 1 }}>{r.label}</span>
                  <span style={{ color: "#475569", marginRight: 12 }}>TDEE {r.tdee}</span>
                  <span style={{ color: "#22d3ee", fontWeight: 700, marginRight: 8 }}>→ {r.goal}</span>
                  <span style={{ color: "#64748b" }}>{r.deficit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB 1 — HOW I FEEL
        ══════════════════════════════════════════════ */}
        {activeTab === 1 && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>How are you feeling? 🧠</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Tap a symptom → get fruits & supplements, or ask the diet chat</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 16 }}>
              {symptoms.map(s => (
                <button key={s.id} onClick={() => selectSymptom(s.id)} style={{
                  background: selectedSymptom === s.id ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)",
                  border: selectedSymptom === s.id ? "1.5px solid #6366f1" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14, padding: "13px 8px", cursor: "pointer", textAlign: "center",
                  transition: "all 0.18s",
                }}>
                  <div style={{ fontSize: 24, marginBottom: 5 }}>{s.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: selectedSymptom === s.id ? "#818cf8" : "#94a3b8", lineHeight: 1.3 }}>
                    {s.label}
                  </div>
                </button>
              ))}
            </div>

            {selectedSymptom && !showRec && (
              <button onClick={showRecommendations} style={{
                width: "100%", padding: 14, borderRadius: 12,
                background: "linear-gradient(135deg,#6366f1,#22d3ee)",
                border: "none", color: "#fff", fontSize: 14, fontWeight: 800,
                cursor: "pointer", marginBottom: 18, letterSpacing: 0.2,
                transition: "all 0.2s",
              }}>
                ✨ Show Fruits & Supplements
              </button>
            )}

            <div style={{ marginBottom: showRec ? 12 : 0 }}>
              <DietChat symptomLabel={selectedSymptomLabel} />
            </div>

            {currentRec && showRec && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                {/* Fruits */}
                <div style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderLeft: `3px solid ${currentRec.color}`, borderRadius: 14, padding: 14,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>🍎 Best Fruits Right Now</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {currentRec.fruits.map((f, i) => (
                      <span key={i} style={{
                        background: `${currentRec.color}18`, border: `1px solid ${currentRec.color}40`,
                        borderRadius: 20, padding: "5px 11px", fontSize: 12, color: "#e2e8f0",
                      }}>{f}</span>
                    ))}
                  </div>
                </div>

                {/* Supplements */}
                <div style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderLeft: "3px solid #6366f1", borderRadius: 14, padding: 14,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>💊 Recommended Supplements</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {currentRec.supps.map((s, i) => (
                      <span key={i} style={{
                        background: "rgba(99,102,241,0.13)", border: "1px solid rgba(99,102,241,0.3)",
                        borderRadius: 20, padding: "5px 11px", fontSize: 12, color: "#818cf8",
                      }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Static tip */}
                <div style={{
                  background: `${currentRec.color}10`, border: `1px solid ${currentRec.color}30`,
                  borderRadius: 14, padding: 14,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 5, color: currentRec.color }}>📌 Insight for Your Lifestyle</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.65 }}>{currentRec.tip}</div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB 2 — WEEKLY PLAN
        ══════════════════════════════════════════════ */}
        {activeTab === 2 && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>Weekly Plan 📅</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Meals calibrated to your exact targets per day type</div>
            </div>

            {weeklyPlan.map((day, i) => {
              const ts = typeStyle[day.type];
              return (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderLeft: `3px solid ${ts.border.replace("0.35","0.8").replace("0.3","0.8").replace("0.25","0.8")}`,
                  borderRadius: 15, padding: 14, marginBottom: 10,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 9,
                        background: ts.bg, display: "flex", alignItems: "center",
                        justifyContent: "center", fontWeight: 900, fontSize: 12, color: ts.text,
                      }}>{day.day}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{day.focus}</div>
                        <div style={{ fontSize: 10, color: "#475569" }}>{day.activity}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                        background: ts.bg, border: `1px solid ${ts.border}`, color: ts.text,
                        display: "block", marginBottom: 2,
                      }}>{ts.label}</span>
                      <div style={{ fontSize: 10, color: "#475569" }}>{day.kcal.toLocaleString()} kcal · {day.prot}g prot</div>
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 8 }}>
                    {day.meals.map((meal, j) => (
                      <div key={j} style={{ fontSize: 11, color: "#94a3b8", padding: "2px 0", lineHeight: 1.55 }}>
                        {meal}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div style={{
              background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 14, padding: 14, marginTop: 4,
            }}>
              <div style={{ fontSize: 12, color: "#818cf8", fontWeight: 700, marginBottom: 5 }}>💡 Practical Tip</div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.65 }}>
                On construction days, pack your lunch the night before — you won't have time mid-shift. Always bring a banana + bread snack. Eating enough on labour days is the biggest mistake people make. Under-eating on a physical work day kills your recovery AND your progress.
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB 3 — SUPPLEMENTS
        ══════════════════════════════════════════════ */}
        {activeTab === 3 && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>Supplements 💊</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Safe, evidence-based stack for a 17-year-old doing physical work</div>
            </div>

            {[
              {
                name: "Creatine Monohydrate",
                dose: "5g/day",
                timing: "Anytime — consistency beats timing",
                goal: "Strength, muscle size, faster recovery",
                color: "#ef4444", priority: "Essential",
                note: "100% safe at 17. Mix in water or your shake. No loading phase needed. You will notice a difference in ~2 weeks.",
              },
              {
                name: "Whey Protein",
                dose: "35g per serving",
                timing: "After training or to hit your 178g daily target",
                goal: "Muscle synthesis — hit 178g protein daily",
                color: "#f97316", priority: "Essential",
                note: "Construction counts as physical work too — protein repairs muscle after labour, not just gym. Use it on work days too.",
              },
              {
                name: "Vitamin D3 + K2",
                dose: "3000–4000 IU D3 + 100mcg K2",
                timing: "With a fatty meal",
                goal: "Testosterone, bone density, immune system, mood",
                color: "#eab308", priority: "Essential",
                note: "Extremely common deficiency, especially in Romania. Low D3 = low testosterone at 17. The K2 prevents D3 from calcifying arteries.",
              },
              {
                name: "Omega-3 Fish Oil",
                dose: "2–3g EPA+DHA per day",
                timing: "With food to avoid fish burps",
                goal: "Joint health, brain development, inflammation",
                color: "#22d3ee", priority: "High",
                note: "At 17 your brain is still developing — Omega-3 is critical. Construction also puts heavy stress on joints. Omega-3 protects them long-term.",
              },
              {
                name: "Magnesium Glycinate",
                dose: "300mg",
                timing: "30 minutes before sleep",
                goal: "Sleep quality, muscle recovery, cramp prevention",
                color: "#8b5cf6", priority: "High",
                note: "Physical labour depletes magnesium through sweat. This is the gentlest form. You will sleep better and wake up less stiff.",
              },
              {
                name: "Zinc",
                dose: "15–20mg (do not exceed)",
                timing: "With a meal",
                goal: "Testosterone production, immune system, recovery",
                color: "#6366f1", priority: "High",
                note: "Critical for natural testosterone development at 17. Don't overdose — 20mg/day is the max. Take with food to avoid nausea.",
              },
              {
                name: "Electrolytes (Na + K + Mg)",
                dose: "1 sachet or salt + banana combo",
                timing: "During and after construction shifts",
                goal: "Hydration, prevent cramps and fatigue",
                color: "#f59e0b", priority: "High",
                note: "At 89kg doing outdoor physical work you can lose 1.5–2L of sweat per hour in heat. Water alone is not enough. Add salt to your bottle.",
              },
              {
                name: "Collagen Peptides + Vitamin C",
                dose: "10g collagen + 500mg Vit C",
                timing: "30 min before training or morning",
                goal: "Tendon, ligament and joint strength",
                color: "#10b981", priority: "Moderate",
                note: "Running + heavy lifting + construction = a lot of load on knees, spine and tendons. This combo is proven to strengthen connective tissue.",
              },
              {
                name: "Vitamin B-Complex",
                dose: "1 tablet/day",
                timing: "Morning with breakfast",
                goal: "Energy metabolism, reduce fatigue",
                color: "#06b6d4", priority: "Moderate",
                note: "Hard physical work burns through B vitamins rapidly. B12 especially — low B12 causes the 'drained' feeling after work days.",
              },
            ].map((s, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                borderLeft: `3px solid ${s.color}`, borderRadius: 14, padding: 14, marginBottom: 10,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, flex: 1, paddingRight: 8 }}>{s.name}</div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap",
                    background: s.priority === "Essential" ? "rgba(239,68,68,0.15)" :
                      s.priority === "High" ? "rgba(34,211,238,0.1)" : "rgba(100,116,139,0.15)",
                    color: s.priority === "Essential" ? "#f87171" :
                      s.priority === "High" ? "#22d3ee" : "#64748b",
                  }}>{s.priority}</span>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.85 }}>
                  <span style={{ color: "#94a3b8" }}>Dose:</span> {s.dose}<br />
                  <span style={{ color: "#94a3b8" }}>When:</span> {s.timing}<br />
                  <span style={{ color: "#94a3b8" }}>Goal:</span> {s.goal}
                </div>
                <div style={{
                  fontSize: 11, color: "#64748b", marginTop: 8, paddingTop: 8,
                  borderTop: "1px solid rgba(255,255,255,0.05)", fontStyle: "italic", lineHeight: 1.55,
                }}>💡 {s.note}</div>
              </div>
            ))}

            <div style={{
              background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 14, padding: 14, marginTop: 4,
            }}>
              <div style={{ fontSize: 12, color: "#f87171", fontWeight: 700, marginBottom: 5 }}>⚠️ Age Note</div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.65 }}>
                All supplements above are considered safe at 17. Avoid stimulant pre-workouts with high caffeine, DMAA, or synephrine — they are too harsh on a developing cardiovascular system. If in doubt, consult a doctor.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
