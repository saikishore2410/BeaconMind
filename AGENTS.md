# BeaconMind Agent Guidelines

BeaconMind is an empathetic mental health navigation assistant designed to lower the cognitive barrier to professional care and provide immediate somatic grounding support.

## Architectural Guidelines

1. **Empathetic & Minimal Cognitive Load Chatbot**:
   - The chatbot (`/api/chat`) must prioritize short, clear, scannable responses (1-2 sentences max per paragraph).
   - Use bullet points, bold markers, and clean headings to avoid overwhelming users under high stress.
   - Always offer safe, immediate access to crisis resources like the 988 lifeline.

2. **Somatic Grounding Space**:
   - Maintain client-side somatic exercises (Breathing Pacer, 5-4-3-2-1 Sensory Grounding).
   - Allow users to log pre/post stress values and save them locally.

3. **Care Logs & Exporter (Fieldwork Integration)**:
   - Persist logs locally using `localStorage`.
   - Provide clean mechanisms to export logs and drafted search plans into a consolidated text file. This serves as a vital packet for users to share with their actual therapists, psychiatrists, or clinical caseworkers in the field.

4. **Multi-Agent Specialist System**:
   - The `/api/chat` route supports multiple agent roles:
     - **Clinical Navigator**: Specialized in helping users prepare questions, find directory filters, and drafting email letters.
     - **Somatic Coach**: Specialized in somatic grounding, physical pacing, and breathing.
     - **Empathetic Validation Companion**: Specialized in validating experiences, deep empathy, and non-judgmental listening.
