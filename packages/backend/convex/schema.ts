import {defineSchema,defineTable} from "convex/server"; 
import { v } from "convex/values";
export default defineSchema({


    
    

    subscriptions: defineTable({
  organizationId: v.string(),
  status: v.string(),
})
.index("by_organization_id", ["organizationId"])
,















    widgetSettings: defineTable({
  organizationId: v.string(),
  // Visual customization
  theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
  icon: v.optional(v.string()),
  title: v.optional(v.string()),
  visibility: v.optional(v.boolean()),
  // Conversational customization
  greetMessage: v.string(),
  defaultSuggestions: v.object({
    suggestion1: v.optional(v.string()),
    suggestion2: v.optional(v.string()),
    suggestion3: v.optional(v.string()),
  }),
  vapiSettings: v.object({
    assistantId: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  }),
})
.index("by_organization_id", ["organizationId"]),




    plugins: defineTable({
        organizationId: v.string(),
        service: v.union(v.literal("vapi")),
        secretName: v.string(),
        })
        .index("by_organization_id", ["organizationId"])
       .index("by_organization_id_and_service", ["organizationId", "service"]),

    // Knowledge Base for RAG Integration (uses Google Gemini embeddings - 3072 dimensions)
    knowledgeBase: defineTable({
        organizationId: v.string(),
        title: v.string(),
        content: v.string(),
        mimeType: v.string(),
        fileName: v.string(),
        embedUrl: v.optional(v.string()),
        storageId: v.optional(v.id("_storage")),
        embedding: v.optional(v.array(v.float64())),
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    })
    .index("by_organization_id", ["organizationId"])
    .index("by_created_at", ["createdAt"])
    .vectorIndex("by_embedding", {
        vectorField: "embedding",
        dimensions: 3072,
        filterFields: ["organizationId"]
    }),

























    conversations: defineTable({
        threadId: v.string(),
        organizationId: v.string(),
        contactSessionId: v.id("contactSessions"),
        status: v.union(
            v.literal("unresolved"),
            v.literal("escalated"),
            v.literal("resolved")
        ),
        })
            .index("by_organization_id", ["organizationId"])
            .index("by_contact_session_id", ["contactSessionId"])
            .index("by_thread_id", ["threadId"])
            .index("by_status_and_organization_id", ["status", "organizationId"]),




    contactSessions: defineTable({
        name: v.string(),
        email: v.string(),
        organizationId: v.string(),
        expiresAt: v.number(),
        metadata: v.optional(v.object({
            userAgent: v.optional(v.string()),
            language:v.optional( v.string()),
            languages: v.optional(v.optional(v.string())),
            platform:v.optional( v.string()),
            vendor: v.optional(v.string()),
            screenResolution:v.optional( v.string()),
            viewportSize:v.optional( v.string()),
            timezone:v.optional( v.string()),
            timezoneOffset:v.optional( v.number()),
            cookieEnabled:v.optional( v.boolean()),
            referrer:v.optional( v.string()),
            currentUrl: v.optional(v.string()),
        })),
    })
    .index("by_organization_id", ["organizationId"])
    .index("by_expires_at", ["expiresAt"]),
    users: defineTable({
        name: v.string(),
    }),
});