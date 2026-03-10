# EchoVault Development Guide

## Project Context

EchoVault is a **Personal Knowledge OS** - an AI-powered local-first knowledge base with semantic search, RAG chat, knowledge graph visualization, and AI insights. Think of it as Obsidian meets Perplexity, running entirely locally.

**Tech Stack:**
- Frontend: Next.js 16 + React 19 + Tailwind 4
- Backend: Supabase (PostgreSQL + Auth + pgvector)
- AI: Ollama (minimax-m2.5:cloud for chat, nomic-embed-text for embeddings)
- UI Libraries: shadcn/ui + Aceternity UI
- State: Zustand + React Query

**Current Status:** ~50% complete
- ✅ Auth, Database Schema, API Routes, Basic UI
- 🚧 Inbox, Insights, Graph pages need implementation
- 🎨 UI needs major polish with shadcn + Aceternity

---

## Core Development Rules

### 1. Code Quality Standards

**ALWAYS follow these principles:**

1. **Type Safety First**
   - Use TypeScript strictly - no `any` types unless absolutely necessary
   - Define interfaces for all data structures in `src/types/index.ts`
   - Use Zod for runtime validation on forms and API routes

2. **Component Architecture**
   ```typescript
   // ✅ GOOD: Modular, typed, with clear responsibilities
   interface KnowledgeCardProps {
     item: KnowledgeItem;
     onEdit: (id: string) => void;
     onDelete: (id: string) => void;
   }
   
   export function KnowledgeCard({ item, onEdit, onDelete }: KnowledgeCardProps) {
     // Single responsibility, testable, reusable
   }
   
   // ❌ BAD: Monolithic, untyped, unclear
   function Card(props: any) {
     // Mixed concerns, hard to test
   }
   ```

3. **File Naming & Organization**
   - Components: PascalCase (`KnowledgeCard.tsx`)
   - Utilities: camelCase (`formatDate.ts`)
   - Pages: kebab-case (`knowledge-vault/page.tsx`)
   - One component per file (except tiny sub-components)

4. **Error Handling**
   ```typescript
   // ALWAYS wrap API calls and handle errors gracefully
   try {
     const response = await fetch('/api/knowledge');
     if (!response.ok) throw new Error('Failed to fetch');
     const data = await response.json();
     return data;
   } catch (error) {
     console.error('Knowledge fetch error:', error);
     toast.error('Failed to load knowledge items');
     return null;
   }
   ```

### 2. UI/UX Guidelines

**Use shadcn/ui + Aceternity for ALL new components:**

1. **Component Hierarchy**
   - shadcn/ui for base components (Button, Input, Card, Dialog)
   - Aceternity for advanced effects (Spotlight, BentoGrid, AnimatedTooltip, 3D Card Effect)
   - Custom components only when neither library has what you need

2. **Design System**
   ```typescript
   // Follow this color scheme (defined in tailwind.config.ts)
   const theme = {
     primary: 'hsl(var(--primary))',      // Main brand color
     secondary: 'hsl(var(--secondary))',  // Accents
     muted: 'hsl(var(--muted))',          // Backgrounds
     border: 'hsl(var(--border))',        // Dividers
   }
   
   // Use semantic colors, not hardcoded values
   <div className="bg-background text-foreground border-border">
   ```

3. **Animation Standards**
   - Use Framer Motion for page transitions
   - Aceternity for hover effects and micro-interactions
   - Keep animations subtle (200-300ms typically)
   - ALWAYS provide reduced-motion alternatives

4. **Responsive Design**
   ```tsx
   // Mobile-first approach
   <div className="
     grid grid-cols-1        // Mobile: 1 column
     md:grid-cols-2          // Tablet: 2 columns
     lg:grid-cols-3          // Desktop: 3 columns
     gap-4 md:gap-6          // Responsive spacing
   ">
   ```

### 3. State Management

**Follow these patterns:**

1. **Server State (React Query)**
   ```typescript
   // For data from APIs
   const { data, isLoading, error } = useQuery({
     queryKey: ['knowledge', filters],
     queryFn: () => fetchKnowledge(filters),
     staleTime: 5 * 60 * 1000, // 5 minutes
   });
   ```

2. **Client State (Zustand)**
   ```typescript
   // For UI state only
   const useUIStore = create<UIState>((set) => ({
     viewMode: 'grid',
     setViewMode: (mode) => set({ viewMode: mode }),
   }));
   ```

3. **Form State (React Hook Form + Zod)**
   ```typescript
   const formSchema = z.object({
     title: z.string().min(1, 'Title is required'),
     content: z.string(),
   });
   
   const form = useForm<z.infer<typeof formSchema>>({
     resolver: zodResolver(formSchema),
   });
   ```

### 4. API Route Patterns

**Every API route MUST follow this structure:**

```typescript
// /app/api/[endpoint]/route.ts

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // 1. Auth check (unless public endpoint)
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 2. Parse request (query params, body, etc.)
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    // 3. Validate input
    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query too short' }, 
        { status: 400 }
      );
    }
    
    // 4. Business logic
    const results = await performSearch(query, user.id);
    
    // 5. Return response
    return NextResponse.json({ results, count: results.length });
    
  } catch (error) {
    console.error('[API_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
```

### 5. Ollama Integration

**CRITICAL: Use minimax-m2.5:cloud model correctly:**

```typescript
// /lib/ollama.ts - Configuration
const OLLAMA_CONFIG = {
  baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  chatModel: 'minimax-m2.5:cloud',  // NOT 'llama3.2'!
  embeddingModel: 'nomic-embed-text',
  
  // Context window optimization
  contextLength: 1000000,  // minimax has HUGE context (1M tokens!)
  temperature: 0.7,
  topP: 0.9,
};

// Chat completion with streaming
export async function chat(
  messages: Message[],
  onToken?: (token: string) => void
) {
  const response = await fetch(`${OLLAMA_CONFIG.baseURL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_CONFIG.chatModel,
      messages,
      stream: true,
      options: {
        num_ctx: OLLAMA_CONFIG.contextLength,
        temperature: OLLAMA_CONFIG.temperature,
        top_p: OLLAMA_CONFIG.topP,
      },
    }),
  });
  
  // Stream handling...
}
```

---

## Feature Development Checklist

When implementing ANY new feature, follow these steps:

### Step 1: Plan & Design
- [ ] Define feature requirements clearly
- [ ] Sketch UI/UX flow (wireframe or description)
- [ ] Identify required API endpoints
- [ ] Check if shadcn/Aceternity has relevant components
- [ ] Plan database schema changes (if any)

### Step 2: Backend Implementation
- [ ] Update database schema in Supabase if needed
- [ ] Create/update API route with proper error handling
- [ ] Add TypeScript types in `src/types/index.ts`
- [ ] Test API route with curl/Postman

### Step 3: Frontend Implementation
- [ ] Install required shadcn components: `npx shadcn@latest add [component]`
- [ ] Create React Query hooks for data fetching
- [ ] Build UI components using shadcn + Aceternity
- [ ] Add loading states, error states, empty states
- [ ] Implement optimistic updates where appropriate

### Step 4: Polish
- [ ] Add animations with Framer Motion or Aceternity
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Add keyboard shortcuts if relevant
- [ ] Test accessibility (keyboard navigation, screen readers)
- [ ] Add error boundaries for crash prevention

### Step 5: Testing
- [ ] Test happy path
- [ ] Test error cases
- [ ] Test edge cases (empty data, large data, etc.)
- [ ] Verify performance (no unnecessary re-renders)

---

## Common Patterns & Examples

### Pattern 1: Creating a New Page

```typescript
// /app/(dashboard)/new-page/page.tsx

import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <PageHeader
        title="Page Title"
        description="Brief description of what this page does"
        action={
          <Button>Primary Action</Button>
        }
      />
      
      <Suspense fallback={<PageSkeleton />}>
        <PageContent />
      </Suspense>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
```

### Pattern 2: Data Fetching Component

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export function DataComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['data-key'],
    queryFn: async () => {
      const res = await fetch('/api/endpoint');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });
  
  if (isLoading) return <DataSkeleton />;
  
  if (error) return (
    <Card className="p-6 border-destructive">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <p>Failed to load data. Please try again.</p>
      </div>
    </Card>
  );
  
  if (!data || data.length === 0) return (
    <Card className="p-12 text-center text-muted-foreground">
      <p>No data found. Create your first item!</p>
    </Card>
  );
  
  return (
    <div className="grid gap-4">
      {data.map(item => <ItemCard key={item.id} item={item} />)}
    </div>
  );
}
```

### Pattern 3: Modal/Dialog with Form

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';

const formSchema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().optional(),
});

export function CreateDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', description: '' },
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      if (!res.ok) throw new Error('Failed');
      
      setOpen(false);
      form.reset();
      // Invalidate React Query cache to refetch
    } catch (error) {
      console.error(error);
      // Show error toast
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Item</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Create</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Performance Optimization

### 1. React Query Configuration

```typescript
// /app/providers.tsx

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 10 * 60 * 1000,        // 10 minutes (formerly cacheTime)
      retry: 1,                       // Retry failed requests once
      refetchOnWindowFocus: false,    // Don't refetch on window focus
    },
  },
});
```

### 2. Image Optimization

```tsx
// Always use Next.js Image component
import Image from 'next/image';

<Image
  src={imageUrl}
  alt="Description"
  width={400}
  height={300}
  className="rounded-lg"
  loading="lazy"  // Lazy load off-screen images
/>
```

### 3. Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false,  // Disable SSR if not needed
});
```

---

## Debugging Checklist

When something isn't working:

1. **Check Browser Console** - Look for errors/warnings
2. **Check Network Tab** - Verify API calls are successful
3. **Check Supabase Logs** - Database errors show here
4. **Check Ollama Status** - Run `curl http://localhost:11434/api/tags`
5. **Verify Environment Variables** - Make sure .env.local is correct
6. **Check React Query DevTools** - Install for query debugging
7. **Use React DevTools** - Inspect component state/props

---

## Next Steps (Priority Order)

### 🔴 High Priority

1. **Complete Inbox Page**
   - File upload handling (PDF, images, audio)
   - Automatic embedding generation
   - Quick actions (star, tag, move to vault)

2. **Complete Insights Page**
   - Connect to `/api/insights`
   - Display AI-generated summaries
   - Connection suggestions between items
   - Trending topics

3. **Improve Knowledge Vault UI**
   - Replace basic cards with Aceternity 3D Card Effect
   - Add BentoGrid layout option
   - Implement infinite scroll
   - Better tag management

### 🟡 Medium Priority

4. **Complete Graph Page**
   - React Flow integration
   - Node clustering by tags/topics
   - Interactive exploration
   - 3D visualization option

5. **Complete Settings Page**
   - User preferences
   - Ollama model selection
   - Export/import data
   - Theme customization

6. **Enhance Search**
   - Filters by date, type, tags
   - Search suggestions
   - Recent searches
   - Search analytics

### 🟢 Low Priority

7. **Add Collaborative Features**
   - Share knowledge items
   - Public/private links
   - Collaborative editing

8. **Mobile App**
   - PWA optimization
   - Offline support
   - Mobile-specific UI

---

## Resources

- [shadcn/ui Components](https://ui.shadcn.com/)
- [Aceternity UI](https://ui.aceternity.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [React Query Docs](https://tanstack.com/query/latest)

---

## Final Notes

**When in doubt:**
- Prioritize user experience over features
- Keep it simple and performant
- Test on real devices, not just desktop
- Write code you'd want to review 6 months from now
- Ask for clarification rather than assume

**Remember:** EchoVault is about helping users think better by organizing their knowledge. Every feature should serve that goal.