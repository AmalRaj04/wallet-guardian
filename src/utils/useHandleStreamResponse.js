import { useCallback, useRef, useEffect } from 'react';

function useHandleStreamResponse({ onChunk, onFinish }) {
  const handlerRef = useRef();

  const handleStreamResponse = useCallback(
    async (response) => {
      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onFinish(content);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              onFinish(content);
              return;
            }
            try {
              const parsed = JSON.parse(data);
              let deltaContent = '';
              if (parsed.delta) deltaContent = parsed.delta;
              else if (parsed.choices?.[0]?.delta?.content) deltaContent = parsed.choices[0].delta.content;

              if (deltaContent) {
                content += deltaContent;
                onChunk(content);
              }
            } catch (e) {
              // ignore malformed JSON
            }
          }
        }
      }
    },
    [onChunk, onFinish]
  );

  handlerRef.current = handleStreamResponse;
  useEffect(() => { handlerRef.current = handleStreamResponse; }, [handleStreamResponse]);

  return useCallback((response) => handlerRef.current(response), []);
}

export default useHandleStreamResponse;
