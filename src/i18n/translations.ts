import { Language, LandmarkType } from '../types/shm';

export interface Translations {
  studioTitle: string;
  studioSubtitle: string;
  tabs: {
    time: string;
    timeShort: string;
    phase: string;
    phaseShort: string;
    scrubber: string;
    scrubberShort: string;
  };
  controls: {
    parameters: string;
    amplitude: string;
    omega: string;
    initialPhase: string;
    playback: string;
    play: string;
    pause: string;
    stepBack: string;
    stepForward: string;
    resetTime: string;
    speed: string;
    visibility: string;
    dispCurve: string;
    velCurve: string;
    accCurve: string;
    phaseOptions: string;
    ellipseMode: string;
    circleMode: string;
    restoreEllipse: string;
    circlePreset: string;
    circleActive: string;
    ghostLock: string;
    ghostRestore: string;
    ghostClear: string;
    ghostActiveNote: string;
    scrubberOptions: string;
    gridSnap: string;
    snapFree: string;
    showTangents: string;
    dragHint: string;
    resetAll: string;
    langToggle: string;
  };
  telemetry: {
    header: string;
    timeReadout: string;
    periodRatio: string;
    totalPhase: string;
    displacement: string;
    velocity: string;
    acceleration: string;
    vMax: string;
    aMax: string;
    period: string;
    frequency: string;
    landmarkHeader: string;
    landmarks: Record<LandmarkType, { title: string; detail: string }>;
    slopeHeader: string;
    slopeXt: string;
    slopeVt: string;
    slopeAx: string;
    equationsHeader: string;
    identityHeader: string;
    identityVerified: string;
    dualRootsHeader: string;
    rootPos: string;
    rootNeg: string;
  };
  canvas: {
    oscillatorStrip: string;
    massLabel: string;
    dragMassPrompt: string;
    equilibrium: string;
    dispPlotTitle: string;
    velPlotTitle: string;
    accPlotTitle: string;
    phaseEllipseTitle: string;
    accDispLineTitle: string;
    circleSpecialTag: string;
    slopeLabel: string;
    ghostLegend: string;
    currentLegend: string;
    timeAxis: string;
    dispAxis: string;
    velAxis: string;
    accAxis: string;
    tangentXt: string;
    tangentVt: string;
    dualRootTitle: string;
    scrubberTimeTitle: string;
    clickDragHint: string;
    upperFlow: string;
    lowerFlow: string;
    zeroCrossings: string;
    extrema: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  bn: {
    studioTitle: 'সরল ছন্দিত স্পন্দনের লেখচিত্র ও ফেজ-স্পেস স্টুডিও',
    studioSubtitle: 'সরণ, বেগ ও ত্বরণের তাৎক্ষণিক সমীকরণ ও জ্যামিতিক বিশ্লেষণ',
    tabs: {
      time: 'মডিউল ১: সময়-ভিত্তিক লেখচিত্র (x-t, v-t, a-t)',
      timeShort: 'মডিউল ১: x-t, v-t, a-t',
      phase: 'মডিউল ২: সরণ-ভিত্তিক ও ফেজ-স্পেস (v-x, a-x)',
      phaseShort: 'মডিউল ২: v-x ও a-x',
      scrubber: 'মডিউল ৩: স্ক্রাবার ও গাণিতিক বিশ্লেষক',
      scrubberShort: 'মডিউল ৩: স্ক্রাবার ও বিশ্লেষক',
    },
    controls: {
      parameters: 'গতির প্যারামিটার',
      amplitude: 'বিস্তার (A)',
      omega: 'কৌণিক কম্পাঙ্ক (ω)',
      initialPhase: 'আদি দশা (δ)',
      playback: 'প্লেব্যাক ও সময় নিয়ন্ত্রণ',
      play: 'চালু করুন',
      pause: 'বিরতি',
      stepBack: 'পিছনে',
      stepForward: 'সামনে',
      resetTime: 't = 0',
      speed: 'গতি',
      visibility: 'লেখচিত্র দৃশ্যমানতা',
      dispCurve: 'সরণ x(t)',
      velCurve: 'বেগ v(t)',
      accCurve: 'ত্বরণ a(t)',
      phaseOptions: 'ফেজ-স্পেস তুলনা ও বিশেষ ক্ষেত্র',
      ellipseMode: 'উপবৃত্তাকার (Ellipse)',
      circleMode: 'বৃত্তাকার (ω = 1)',
      restoreEllipse: 'আগের উপবৃত্তে ফিরুন',
      circlePreset: 'ω = 1 rad/s (বৃত্তাকার ফেজ)',
      circleActive: 'বৃত্তাকার ফেজ সক্রিয় (ω = 1)',
      ghostLock: 'আগের লেখচিত্র লক করুন (Ghost)',
      ghostRestore: 'আগের লেখচিত্র ফিরিয়ে আনুন',
      ghostClear: 'Ghost মুছুন',
      ghostActiveNote: 'তুলনার জন্য ড্যাশড রেখা সংরক্ষিত আছে',
      scrubberOptions: 'গ্রাফ স্ক্রাবার ও স্ন্যাপ',
      gridSnap: 'সময় গ্রিড স্ন্যাপ',
      snapFree: 'মুক্ত',
      showTangents: 'স্পর্শক ও ঢাল (dx/dt, dv/dt) দেখান',
      dragHint: 'স্প্রিং-ভর সরাসরি টেনে সরণ x পরিবর্তন করুন অথবা গ্রাফে ক্লিক করে সময় t স্ক্রাব করুন।',
      resetAll: 'রিসেট',
      langToggle: 'English',
    },
    telemetry: {
      header: 'তাৎক্ষণিক কাইনেম্যাটিক টেলিমেট্রি',
      timeReadout: 'সময় (t)',
      periodRatio: 'পর্যায়কালের ভগ্নাংশ (t/T)',
      totalPhase: 'মোট দশা (φ = ωt + δ)',
      displacement: 'সরণ (x)',
      velocity: 'বেগ (v)',
      acceleration: 'ত্বরণ (a)',
      vMax: 'সর্বোচ্চ বেগ (ωA)',
      aMax: 'সর্বোচ্চ ত্বরণ (ω²A)',
      period: 'পর্যায়কাল (T)',
      frequency: 'কম্পাঙ্ক (f)',
      landmarkHeader: 'গুরুত্বপূর্ণ অবস্থান শনাক্তকারী',
      landmarks: {
        equilibrium_pos: {
          title: 'সাম্যাবস্থান (x ≈ 0, ধনাত্মক গতি)',
          detail: 'বেগ সর্বোচ্চ (+vₘₐₓ), ত্বরণ শূন্য (a = 0)',
        },
        equilibrium_neg: {
          title: 'সাম্যাবস্থান (x ≈ 0, ঋণাত্মক গতি)',
          detail: 'বেগ সর্বনিম্ন (-vₘₐₓ), ত্বরণ শূন্য (a = 0)',
        },
        positive_extreme: {
          title: 'ধনাত্মক প্রান্তবিন্দু (x = +A)',
          detail: 'বেগ শূন্য (v = 0), ত্বরণ সর্বোচ্চ ঋণাত্মক (-aₘₐₓ)',
        },
        negative_extreme: {
          title: 'ঋণাত্মক প্রান্তবিন্দু (x = -A)',
          detail: 'বেগ শূন্য (v = 0), ত্বরণ সর্বোচ্চ ধনাত্মক (+aₘₐₓ)',
        },
        general: {
          title: 'মধ্যবর্তী স্পন্দন দশা',
          detail: 'ত্বরণ সর্বদা সরণের বিপরীতমুখী (a = -ω²x)',
        },
      },
      slopeHeader: 'স্পর্শকের ঢাল ও ডেরিভেটিভ',
      slopeXt: 'x-t রেখার ঢাল (dx/dt = v)',
      slopeVt: 'v-t রেখার ঢাল (dv/dt = a)',
      slopeAx: 'a-x সরলরেখার ঢাল (-ω²)',
      equationsHeader: 'তাৎক্ষণিক সমীকরণ মূল্যায়ন',
      identityHeader: 'ত্রিকোণমিতিক অভেদ যাচাই',
      identityVerified: 'সকল মুহূর্তে ধ্রুবক (= 1.000)',
      dualRootsHeader: 'সরণ x থেকে বেগের দুটি মূল',
      rootPos: 'ধনাত্মক শাখা (+v)',
      rootNeg: 'ঋণাত্মক শাখা (-v)',
    },
    canvas: {
      oscillatorStrip: 'সমন্বিত স্প্রিং-ভর দোলক (রেফারেন্স)',
      massLabel: 'm',
      dragMassPrompt: 'ভরটিকে টেনে সরণ পরিবর্তন করুন',
      equilibrium: 'সাম্যাবস্থা (x=0)',
      dispPlotTitle: 'সরণ বনাম সময় · x(t) = A sin(ωt + δ)',
      velPlotTitle: 'বেগ বনাম সময় · v(t) = ωA cos(ωt + δ)',
      accPlotTitle: 'ত্বরণ বনাম সময় · a(t) = -ω²A sin(ωt + δ)',
      phaseEllipseTitle: 'ফেজ-স্পেস উপবৃত্ত · (x/A)² + (v/ωA)² = 1',
      accDispLineTitle: 'ত্বরণ বনাম সরণ · a = -ω²x',
      circleSpecialTag: 'বিশেষ ক্ষেত্র: ω = 1 → বৃত্ত',
      slopeLabel: 'ঢাল = tanθ = -ω²',
      ghostLegend: 'পূর্ববর্তী লেখচিত্র (Ghost)',
      currentLegend: 'বর্তমান লেখচিত্র',
      timeAxis: 'সময় t (s)',
      dispAxis: 'সরণ x (m)',
      velAxis: 'বেগ v (m/s)',
      accAxis: 'ত্বরণ a (m/s²)',
      tangentXt: 'স্পর্শক ঢাল dx/dt = v',
      tangentVt: 'স্পর্শক ঢাল dv/dt = a',
      dualRootTitle: 'ফেজ-স্পেস দ্বৈত মূল বিশ্লেষক (v = ±ω√(A² - x²))',
      scrubberTimeTitle: 'সময়-ভিত্তিক স্পর্শক ও ঢাল স্ক্রাবার (0 → 2T)',
      clickDragHint: 'যেকোনো বিন্দুতে ক্লিক বা ড্র্যাগ করে সময়/সরণ স্ক্রাব করুন',
      upperFlow: 'v > 0 (ডানমুখী গতি)',
      lowerFlow: 'v < 0 (বামমুখী গতি)',
      zeroCrossings: 'শূন্য-ছেদবিন্দু',
      extrema: 'চরম বিন্দু',
    },
  },
  en: {
    studioTitle: 'SHM Kinematic Graphs & Phase-Space Dynamics Studio',
    studioSubtitle: 'Synchronized time-domain waveforms, phase trajectories & derivative slopes',
    tabs: {
      time: 'Module 1: Time-Domain Sync (x-t, v-t, a-t)',
      timeShort: 'Module 1: x-t, v-t, a-t',
      phase: 'Module 2: Position & Phase-Space (v-x, a-x)',
      phaseShort: 'Module 2: v-x & a-x',
      scrubber: 'Module 3: Graph Scrubber & Analyzer',
      scrubberShort: 'Module 3: Scrubber & Solver',
    },
    controls: {
      parameters: 'Oscillator Parameters',
      amplitude: 'Amplitude (A)',
      omega: 'Angular Frequency (ω)',
      initialPhase: 'Initial Phase (δ)',
      playback: 'Playback & Time Scrubbing',
      play: 'Play',
      pause: 'Pause',
      stepBack: 'Step -',
      stepForward: 'Step +',
      resetTime: 't = 0',
      speed: 'Speed',
      visibility: 'Curve Visibility',
      dispCurve: 'Displacement x(t)',
      velCurve: 'Velocity v(t)',
      accCurve: 'Acceleration a(t)',
      phaseOptions: 'Comparison & Special Cases',
      ellipseMode: 'Elliptical (v-x)',
      circleMode: 'Circular (ω = 1)',
      restoreEllipse: 'Restore Elliptical Graph',
      circlePreset: 'Set ω = 1 rad/s (Circle)',
      circleActive: 'Circular Phase Active (ω = 1)',
      ghostLock: 'Lock Ghost Reference Curve',
      ghostRestore: 'Restore Previous Curve',
      ghostClear: 'Clear Ghost',
      ghostActiveNote: 'Dashed reference curve locked for comparison',
      scrubberOptions: 'Scrubber Snap & Tangents',
      gridSnap: 'Time Grid Snap',
      snapFree: 'Free',
      showTangents: 'Show Tangent Slope Triangles',
      dragHint: 'Drag the mass directly along [-A, +A] or scrub along the time axis.',
      resetAll: 'Reset',
      langToggle: 'বাংলা',
    },
    telemetry: {
      header: 'Real-Time Kinematic Telemetry',
      timeReadout: 'Time (t)',
      periodRatio: 'Period Fraction (t/T)',
      totalPhase: 'Total Phase (φ = ωt + δ)',
      displacement: 'Displacement (x)',
      velocity: 'Velocity (v)',
      acceleration: 'Acceleration (a)',
      vMax: 'Max Velocity (ωA)',
      aMax: 'Max Accel (ω²A)',
      period: 'Time Period (T)',
      frequency: 'Frequency (f)',
      landmarkHeader: 'Landmark Detector',
      landmarks: {
        equilibrium_pos: {
          title: 'Mean Position (x ≈ 0, +v)',
          detail: 'Maximum speed (+vₘₐₓ), zero acceleration (a = 0)',
        },
        equilibrium_neg: {
          title: 'Mean Position (x ≈ 0, -v)',
          detail: 'Maximum reverse speed (-vₘₐₓ), zero acceleration (a = 0)',
        },
        positive_extreme: {
          title: 'Positive Extreme (x = +A)',
          detail: 'Turning point (v = 0), peak restoring accel (-aₘₐₓ)',
        },
        negative_extreme: {
          title: 'Negative Extreme (x = -A)',
          detail: 'Turning point (v = 0), peak positive accel (+aₘₐₓ)',
        },
        general: {
          title: 'Intermediate Oscillation',
          detail: 'Restoring acceleration opposes displacement (a = -ω²x)',
        },
      },
      slopeHeader: 'Instantaneous Slope & Calculus',
      slopeXt: 'x-t Tangent Slope (dx/dt = v)',
      slopeVt: 'v-t Tangent Slope (dv/dt = a)',
      slopeAx: 'a-x Line Slope (-ω²)',
      equationsHeader: 'Live Equation Evaluator',
      identityHeader: 'Kinematic Identity Verifier',
      identityVerified: 'Invariant across all phases (= 1.000)',
      dualRootsHeader: 'Symmetric Velocity Roots at x',
      rootPos: 'Upper Branch (+v)',
      rootNeg: 'Lower Branch (-v)',
    },
    canvas: {
      oscillatorStrip: 'Coupled Frictionless Mass-Spring Oscillator',
      massLabel: 'm',
      dragMassPrompt: 'Drag mass along [-A, +A]',
      equilibrium: 'Eq (x=0)',
      dispPlotTitle: 'Displacement vs Time · x(t) = A sin(ωt + δ)',
      velPlotTitle: 'Velocity vs Time · v(t) = ωA cos(ωt + δ)',
      accPlotTitle: 'Acceleration vs Time · a(t) = -ω²A sin(ωt + δ)',
      phaseEllipseTitle: 'Phase-Space Ellipse · (x/A)² + (v/ωA)² = 1',
      accDispLineTitle: 'Acceleration vs Displacement · a = -ω²x',
      circleSpecialTag: 'Special Case: ω = 1 → Circle',
      slopeLabel: 'Slope = tanθ = -ω²',
      ghostLegend: 'Locked Ghost Curve',
      currentLegend: 'Active Curve',
      timeAxis: 'Time t (s)',
      dispAxis: 'x (m)',
      velAxis: 'v (m/s)',
      accAxis: 'a (m/s²)',
      tangentXt: 'Tangent Slope dx/dt = v',
      tangentVt: 'Tangent Slope dv/dt = a',
      dualRootTitle: 'Phase-Space Dual Root Analyzer · v = ±ω√(A² - x²)',
      scrubberTimeTitle: 'Time-Domain Tangent & Slope Scrubber (0 → 2T)',
      clickDragHint: 'Click or drag anywhere on graphs to scrub time or position',
      upperFlow: 'v > 0 (Rightward)',
      lowerFlow: 'v < 0 (Leftward)',
      zeroCrossings: 'Zero-crossing',
      extrema: 'Extremum',
    },
  },
};
