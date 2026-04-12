type DraftInput = {
  name: string;
  company: string;
  goal: string;
};

export function generateDraftFromTemplate({
  name,
  company,
  goal,
}: DraftInput) {
  const subject = `Internship interest - quick introduction for ${company}`;
  const body = `Hi ${name},

I hope you are doing well. My name is [Your Name], and I am reaching out because I am very interested in internship opportunities with ${company}.

I have been following ${company}'s work around ${goal}, and that is one of the main reasons I wanted to introduce myself.

I am currently building experience through [relevant coursework, projects, or internships], with a focus on [skill area 1], [skill area 2], and [skill area 3]. I would be glad to share a few examples of projects that may be relevant to your team.

If there is someone on your team I should speak with, or if there are internship openings I should keep an eye on, I would really appreciate any guidance.

Best,
[Your Name]
[LinkedIn or portfolio]
[Phone number optional]`;

  return { subject, body };
}
