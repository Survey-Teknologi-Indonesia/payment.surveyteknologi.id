"use server";

import pool from "../neon";
import { supabase } from "../supabaseClient";
import { cookies } from "next/headers";

// Get list of all users from Neon
export async function getChatContacts() {
  try {
    const cookieStore = await cookies();
    const currentUserId = cookieStore.get('auth_token')?.value;

    if (!currentUserId) {
      return { success: false, message: "Not authenticated" };
    }

    const res = await pool.query(
      "SELECT account_id, name, jabatan, email, last_seen FROM account WHERE account_id != $1 AND \"isActive\" = true ORDER BY name ASC",
      [currentUserId]
    );

    return { success: true, data: res.rows };
  } catch (err: any) {
    console.error("Error fetching chat contacts:", err);
    return { success: false, message: err.message };
  }
}

// Get or Create Conversation (Supabase)
export async function getOrCreateConversation(targetUserId: string) {
  try {
    const cookieStore = await cookies();
    const currentUserId = cookieStore.get('auth_token')?.value;

    if (!currentUserId) {
      return { success: false, message: "Not authenticated" };
    }

    // Check if a conversation between these two already exists
    // A conversation exists if there is a conversation_id where both users are participants
    const { data: existingConvos, error: checkError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('account_id', currentUserId);

    if (checkError) throw checkError;

    if (existingConvos && existingConvos.length > 0) {
      const convoIds = existingConvos.map(c => c.conversation_id);
      
      const { data: targetConvo, error: targetError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .in('conversation_id', convoIds)
        .eq('account_id', targetUserId)
        .limit(1)
        .single();

      if (!targetError && targetConvo) {
        return { success: true, conversationId: targetConvo.conversation_id };
      }
    }

    // Create new conversation
    const { data: newConvo, error: insertConvoError } = await supabase
      .from('conversations')
      .insert([{}])
      .select()
      .single();

    if (insertConvoError) throw insertConvoError;

    // Add participants
    const { error: insertParticipantsError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: newConvo.id, account_id: currentUserId },
        { conversation_id: newConvo.id, account_id: targetUserId }
      ]);

    if (insertParticipantsError) throw insertParticipantsError;

    return { success: true, conversationId: newConvo.id };

  } catch (err: any) {
    console.error("Error get/create conversation:", err);
    return { success: false, message: err.message };
  }
}

// Get messages for a conversation
export async function getMessages(conversationId: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return { success: true, data };
  } catch (err: any) {
    console.error("Error fetching messages:", err);
    return { success: false, message: err.message };
  }
}

// Send a message
export async function sendMessage(conversationId: string, messageText: string) {
  try {
    const cookieStore = await cookies();
    const currentUserId = cookieStore.get('auth_token')?.value;

    if (!currentUserId) {
      return { success: false, message: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: currentUserId,
        message: messageText
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (err: any) {
    console.error("Error sending message:", err);
    return { success: false, message: err.message };
  }
}

// Get current user id helper
export async function getCurrentUserId() {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value;
}

// Update last seen
export async function updateLastSeen() {
  try {
    const cookieStore = await cookies();
    const currentUserId = cookieStore.get('auth_token')?.value;

    if (!currentUserId) {
      return { success: false, message: "Not authenticated" };
    }

    await pool.query(
      "UPDATE account SET last_seen = NOW() WHERE account_id = $1",
      [currentUserId]
    );

    return { success: true };
  } catch (err: any) {
    console.error("Error updating last seen:", err);
    return { success: false, message: err.message };
  }
}
