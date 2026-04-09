import { useState, useEffect } from "react";
import {
  Zap, Rocket, BarChart2, Map,
  CheckCircle, XCircle, Target, Briefcase,
  Medal, Calendar, Palette, ChevronRight,
  Star, TrendingUp, Code2, Megaphone,
  Crown, UserCheck, CalendarRange, Video,
  Trophy, Lightbulb
} from "lucide-react";
import "./Careerintelligence.css";

// ── KNOWLEDGE BASE (static, no AI) ──────────────────────────
const ACTIVITY_SKILLS = {
  "Cricket":              ["Teamwork", "Strategy", "Discipline", "Pressure Management", "Leadership"],
  "Football":             ["Teamwork", "Communication", "Endurance", "Quick Decision Making", "Leadership"],
  "Badminton":            ["Focus", "Agility", "Discipline", "Competitive Mindset", "Pressure Management"],
  "Basketball":           ["Teamwork", "Leadership", "Quick Decision Making", "Communication", "Strategy"],
  "Tennis":               ["Focus", "Discipline", "Competitive Mindset", "Pressure Management", "Resilience"],
  "Volleyball":           ["Teamwork", "Communication", "Coordination", "Strategy", "Discipline"],
  "Film Making Club":     ["Creativity", "Storytelling", "Project Management", "Collaboration", "Technical Skills"],
  "Coding Club":          ["Problem Solving", "Technical Skills", "Logical Thinking", "Attention to Detail", "Persistence"],
  "Photography Club":     ["Creativity", "Attention to Detail", "Visual Thinking", "Technical Skills", "Patience"],
  "Drama Club":           ["Communication", "Confidence", "Creativity", "Empathy", "Public Speaking"],
  "Music Club":           ["Creativity", "Discipline", "Collaboration", "Emotional Intelligence", "Focus"],
  "Annual Sports Day":    ["Leadership", "Organization", "Teamwork", "Event Management", "Communication"],
  "Tech Fest":            ["Technical Skills", "Innovation", "Problem Solving", "Presentation Skills", "Collaboration"],
  "Cultural Fest":        ["Organization", "Creativity", "Event Management", "Collaboration", "Communication"],
  "Hackathon":            ["Problem Solving", "Technical Skills", "Innovation", "Pressure Management", "Teamwork"],
  "Dance Competition":    ["Creativity", "Discipline", "Endurance", "Confidence", "Teamwork"],
  "Singing Competition":  ["Confidence", "Creativity", "Public Speaking", "Discipline", "Emotional Intelligence"],
  "Art Exhibition":       ["Creativity", "Attention to Detail", "Visual Thinking", "Patience", "Self Expression"],
  "Debate Competition":   ["Communication", "Critical Thinking", "Public Speaking", "Research", "Confidence"],
};

const CAREER_ROLES = [
  { title: "Product Manager",   Icon: Rocket,       requiredSkills: ["Communication", "Strategy", "Leadership", "Problem Solving", "Teamwork", "Presentation Skills"],               description: "Drive product vision and align teams." },
  { title: "Software Engineer", Icon: Code2,        requiredSkills: ["Technical Skills", "Problem Solving", "Logical Thinking", "Attention to Detail", "Persistence"],               description: "Build and maintain software systems." },
  { title: "UX Designer",       Icon: Palette,      requiredSkills: ["Creativity", "Empathy", "Visual Thinking", "Attention to Detail", "Research"],                                 description: "Design intuitive user experiences." },
  { title: "Marketing Manager", Icon: Megaphone,    requiredSkills: ["Communication", "Creativity", "Storytelling", "Strategy", "Public Speaking"],                                  description: "Shape brand narratives and engagement." },
  { title: "Data Analyst",      Icon: BarChart2,    requiredSkills: ["Logical Thinking", "Attention to Detail", "Problem Solving", "Critical Thinking", "Technical Skills"],         description: "Turn data into actionable insights." },
  { title: "Entrepreneur",      Icon: Crown,        requiredSkills: ["Leadership", "Innovation", "Problem Solving", "Resilience", "Communication", "Strategy"],                      description: "Build something from the ground up." },
  { title: "HR Manager",        Icon: UserCheck,    requiredSkills: ["Communication", "Empathy", "Leadership", "Organization", "Emotional Intelligence"],                            description: "Connect people to purpose." },
  { title: "Event Manager",     Icon: CalendarRange, requiredSkills: ["Organization", "Event Management", "Communication", "Collaboration", "Pressure Management"],                 description: "Orchestrate memorable events." },
  { title: "Content Creator",   Icon: Video,        requiredSkills: ["Creativity", "Storytelling", "Communication", "Self Expression", "Technical Skills"],                          description: "Create content that resonates." },
  { title: "Sports Coach",      Icon: Trophy,       requiredSkills: ["Leadership", "Communication", "Discipline", "Teamwork", "Emotional Intelligence"],                             description: "Inspire athletes to their potential." },
];

function compute(registeredActivities) {
  const skillCount = {};
  const activitySkillMap = {};
  registeredActivities.forEach(act => {
    const skills = ACTIVITY_SKILLS[act.name] || [];
    activitySkillMap[act.name] = skills;
    skills.forEach(s => { skillCount[s] = (skillCount[s] || 0) + 1; });
  });
  const unlockedSkills = Object.keys(skillCount);
  const careerScores = CAREER_ROLES.map(role => {
    const matched = role.requiredSkills.filter(s => unlockedSkills.includes(s));
    const missing = role.requiredSkills.filter(s => !unlockedSkills.includes(s));
    const score = Math.round((matched.length / role.requiredSkills.length) * 100);
    return { ...role, score, matchedSkills: matched, missingSkills: missing };
  }).sort((a, b) => b.score - a.score);
  return { skillCount, unlockedSkills, activitySkillMap, careerScores };
}

const scoreColor = s => s >= 70 ? "#10B981" : s >= 40 ? "#A855F7" : "#8B82A8";
const scoreLabel = s => s >= 80 ? "Excellent" : s >= 60 ? "Strong Match" : s >= 40 ? "Moderate" : s >= 20 ? "Developing" : "Starting";
const levelLabel = c => c >= 3 ? "Expert" : c === 2 ? "Intermediate" : "Beginner";
const levelColor = c => c >= 3 ? "#10B981" : c === 2 ? "#A855F7" : "#8B82A8";

const catIcon = type => {
  if (type === "Sports")  return <Medal size={16} strokeWidth={1.8} />;
  if (type === "Clubs")   return <Target size={16} strokeWidth={1.8} />;
  if (type === "Events")  return <Calendar size={16} strokeWidth={1.8} />;
  return <Palette size={16} strokeWidth={1.8} />;
};

const TABS = [
  { id: "careers", label: "Career Matches", Icon: Briefcase },
  { id: "skills",  label: "My Skills",      Icon: Zap },
  { id: "path",    label: "Activity → Skills", Icon: Map },
];

export default function CareerIntelligence({ registeredActivities = [] }) {
  const [tab, setTab] = useState("careers");
  const [expanded, setExpanded] = useState(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => { setTimeout(() => setAnimated(true), 100); }, [registeredActivities]);

  const { skillCount, unlockedSkills, activitySkillMap, careerScores } = compute(registeredActivities);
  const topSkills = Object.entries(skillCount).sort((a, b) => b[1] - a[1]);

  if (registeredActivities.length === 0) {
    return (
      <div className="ci-root">
        <div className="ci-empty">
          <div className="ci-empty-icon-box"><Target size={36} strokeWidth={1.3} /></div>
          <h3>No activities yet</h3>
          <p>Enroll in activities from Browse — each one maps to real career skills.</p>
          <div className="ci-empty-chain">
            <span className="ci-chain">Coding Club</span>
            <ChevronRight size={13} />
            <span className="ci-chain skill">Problem Solving</span>
            <ChevronRight size={13} />
            <span className="ci-chain career">Software Engineer 80%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ci-root">

      {/* Summary bar */}
      <div className="ci-summary-bar">
        <div className="ci-sum-card">
          <span className="ci-sum-val">{registeredActivities.length}</span>
          <span className="ci-sum-lbl">Activities</span>
        </div>
        <div className="ci-sum-sep" />
        <div className="ci-sum-card">
          <span className="ci-sum-val">{unlockedSkills.length}</span>
          <span className="ci-sum-lbl">Skills Unlocked</span>
        </div>
        <div className="ci-sum-sep" />
        <div className="ci-sum-card accent">
          <span className="ci-sum-val">{careerScores.filter(c => c.score >= 40).length}</span>
          <span className="ci-sum-lbl">Career Matches</span>
        </div>
        {careerScores[0]?.score > 0 && (
          <>
            <div className="ci-sum-sep" />
            <div className="ci-sum-card">
              <span className="ci-sum-val" style={{ color: scoreColor(careerScores[0].score) }}>{careerScores[0].score}%</span>
              <span className="ci-sum-lbl">Top Match: {careerScores[0].title}</span>
            </div>
          </>
        )}
      </div>

      {/* Tab bar */}
      <div className="ci-tabs">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`ci-tab ${tab === id ? "active" : ""}`}
            onClick={() => setTab(id)}
          >
            <Icon size={14} strokeWidth={2} /> {label}
          </button>
        ))}
      </div>

      {/* ── CAREER MATCHES ── */}
      {tab === "careers" && (
        <div className="ci-careers-list">
          {/* Skill gap tip */}
          {careerScores[0]?.missingSkills.length > 0 && (
            <div className="ci-gap-alert">
              <Lightbulb size={16} strokeWidth={1.8} />
              <span>
                <strong>Boost your top match ({careerScores[0].title}):</strong> join activities that build{" "}
                {careerScores[0].missingSkills.slice(0, 3).map((s, i, arr) => (
                  <span key={s}><span className="ci-gap-skill">{s}</span>{i < arr.length - 1 ? ", " : ""}</span>
                ))}.
              </span>
            </div>
          )}

          {careerScores.map(career => {
            const CIcon = career.Icon;
            const isOpen = expanded === career.title;
            return (
              <div
                key={career.title}
                className={`ci-career-row ${isOpen ? "selected" : ""}`}
                onClick={() => setExpanded(isOpen ? null : career.title)}
              >
                <div className="ci-cr-left">
                  <div className="ci-cr-icon-box"><CIcon size={18} strokeWidth={1.7} /></div>
                  <div>
                    <div className="ci-cr-title">{career.title}</div>
                    <div className="ci-cr-desc">{career.description}</div>
                  </div>
                </div>
                <div className="ci-cr-bar-section">
                  <div className="ci-cr-bar-wrap">
                    <div
                      className="ci-cr-bar"
                      style={{ width: animated ? `${career.score}%` : "0%", background: scoreColor(career.score) }}
                    />
                  </div>
                  <div className="ci-cr-score" style={{ color: scoreColor(career.score) }}>
                    {career.score}%
                  </div>
                  <div className="ci-cr-label" style={{ color: scoreColor(career.score) }}>
                    {scoreLabel(career.score)}
                  </div>
                </div>

                {isOpen && (
                  <div className="ci-career-detail">
                    <div className="ci-detail-col">
                      <div className="ci-detail-label"><CheckCircle size={12} strokeWidth={2.5} /> Skills You Have</div>
                      <div className="ci-detail-chips">
                        {career.matchedSkills.length > 0
                          ? career.matchedSkills.map(s => <span key={s} className="ci-chip matched">{s}</span>)
                          : <span className="ci-none">None yet — enroll in more activities</span>}
                      </div>
                    </div>
                    <div className="ci-detail-col">
                      <div className="ci-detail-label"><XCircle size={12} strokeWidth={2.5} /> Skills Still Needed</div>
                      <div className="ci-detail-chips">
                        {career.missingSkills.length > 0
                          ? career.missingSkills.map(s => <span key={s} className="ci-chip missing">{s}</span>)
                          : <span className="ci-perfect">Perfect match! 🎉</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── MY SKILLS ── */}
      {tab === "skills" && (
        <div className="ci-skills-view">
          {topSkills.length === 0 ? (
            <div className="ci-empty-small"><Zap size={24} strokeWidth={1.4} /><p>No skills yet</p></div>
          ) : (
            <div className="ci-skills-grid">
              {topSkills.map(([skill, count]) => (
                <div key={skill} className="ci-skill-card">
                  <div className="ci-skill-top">
                    <span className="ci-skill-name">{skill}</span>
                    <span className="ci-skill-level-label" style={{ color: levelColor(count) }}>
                      {levelLabel(count)}
                    </span>
                  </div>
                  <div className="ci-skill-source">{count} activit{count > 1 ? "ies" : "y"}</div>
                  <div className="ci-skill-level-wrap">
                    <div
                      className="ci-skill-level"
                      style={{
                        width: animated ? `${Math.min(count * 34, 100)}%` : "0%",
                        background: levelColor(count),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ACTIVITY → SKILLS PATH ── */}
      {tab === "path" && (
        <div className="ci-path-view">
          {registeredActivities.map(activity => {
            const skills = activitySkillMap[activity.name] || [];
            const linkedCareers = CAREER_ROLES
              .map(r => ({ ...r, overlap: skills.filter(s => r.requiredSkills.includes(s)) }))
              .filter(r => r.overlap.length > 0)
              .sort((a, b) => b.overlap.length - a.overlap.length)
              .slice(0, 3);

            return (
              <div key={activity.id} className="ci-path-row">
                {/* Activity */}
                <div className="ci-path-activity">
                  <div className="ci-path-act-icon">{catIcon(activity.type)}</div>
                  <div>
                    <div className="ci-path-act-name">{activity.name}</div>
                    <div className="ci-path-act-type">{activity.type}</div>
                  </div>
                </div>

                <ChevronRight size={16} className="ci-path-arrow" />

                {/* Skills */}
                <div className="ci-path-skills">
                  {skills.length > 0
                    ? skills.map(s => <span key={s} className="ci-path-skill-chip">{s}</span>)
                    : <span className="ci-none">No skills mapped</span>}
                </div>

                <ChevronRight size={16} className="ci-path-arrow" />

                {/* Careers */}
                <div className="ci-path-careers">
                  {linkedCareers.length > 0
                    ? linkedCareers.map(career => {
                        const CIcon = career.Icon;
                        return (
                          <div key={career.title} className="ci-path-career-chip">
                            <CIcon size={13} strokeWidth={1.8} />
                            <span>{career.title}</span>
                            <span className="ci-path-overlap">+{career.overlap.length}</span>
                          </div>
                        );
                      })
                    : <span className="ci-none">No career links</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}