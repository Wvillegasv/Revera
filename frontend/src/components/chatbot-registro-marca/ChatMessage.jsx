export default function ChatMessage({ from = "system", children }) {
  return (
    <div className={`crm-chat-message crm-chat-message--${from}`}>
      <div className="crm-chat-bubble">{children}</div>
    </div>
  );
}