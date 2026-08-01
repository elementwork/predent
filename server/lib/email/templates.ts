const APP_URL = process.env.PUBLIC_APP_URL || "https://predent.ca";

export function studyReminderEmail(
  userName: string,
  tasks: { title: string; dueDate: string; category: string }[]
) {
  const taskList = tasks
    .map(
      t =>
        `<li style="margin-bottom:8px"><strong>${t.title}</strong> <span style="color:#64748b">(${t.category})</span> — due ${t.dueDate}</li>`
    )
    .join("");

  return {
    subject: `📚 Study Reminder: ${tasks.length} task${tasks.length > 1 ? "s" : ""} coming up`,
    text: `Hi ${userName},\n\nYou have ${tasks.length} task${tasks.length > 1 ? "s" : ""} due soon:\n\n${tasks.map(t => `- ${t.title} (${t.category}) — due ${t.dueDate}`).join("\n")}\n\nView your planner: ${APP_URL}/dashboard/planner`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#0F172A;margin-bottom:16px">📚 Study Reminder</h2>
        <p style="color:#475569;margin-bottom:16px">Hi ${userName}, you have ${tasks.length} task${tasks.length > 1 ? "s" : ""} due soon:</p>
        <ul style="color:#334155;padding-left:20px;margin-bottom:24px">${taskList}</ul>
        <a href="${APP_URL}/dashboard/planner" style="display:inline-block;background:#2563EB;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">View Planner</a>
        <p style="color:#94A3B8;font-size:12px;margin-top:24px">You can adjust notification preferences in your <a href="${APP_URL}/dashboard/settings/notifications" style="color:#2563EB">settings</a>.</p>
      </div>`,
  };
}

export function communityNotificationEmail(
  userName: string,
  postTitle: string,
  postType: string,
  action: "new_post" | "liked"
) {
  const actionText =
    action === "liked"
      ? `Someone liked your post "${postTitle}"`
      : `New ${postType} post: "${postTitle}"`;

  return {
    subject: actionText,
    text: `Hi ${userName},\n\n${actionText}\n\nView community: ${APP_URL}/community`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#0F172A;margin-bottom:16px">Community Update</h2>
        <p style="color:#475569;margin-bottom:16px">Hi ${userName},</p>
        <p style="color:#334155;margin-bottom:24px">${actionText}</p>
        <a href="${APP_URL}/community" style="display:inline-block;background:#2563EB;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">View Community</a>
        <p style="color:#94A3B8;font-size:12px;margin-top:24px">You can adjust notification preferences in your <a href="${APP_URL}/dashboard/settings/notifications" style="color:#2563EB">settings</a>.</p>
      </div>`,
  };
}
