import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private apiUrl = 'api/messages'; // Replace with your API endpoint
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  
  constructor(private http: HttpClient) { 
    this.loadMessages();
  }
  
  // Load all messages for the current user
  loadMessages(): void {
    this.http.get<Message[]>(`${this.apiUrl}`).subscribe(
      (messages) => {
        this.messagesSubject.next(messages);
      },
      (error) => {
        console.error('Error loading messages:', error);
      }
    );
  }
  
  // Get messages from a specific user
  getMessagesFromUser(userId: string): Observable<Message[]> {
    return this.messages$.pipe(
      map(messages => messages.filter(msg => msg.getSenderId() === userId))
    );
  }
  
  // Get conversation with a specific user
  getConversationWith(userId: string): Observable<Message[]> {
    return this.messages$.pipe(
      map(messages => 
        messages.filter(msg => 
          (msg.getSenderId() === userId || msg.getReceiverId() === userId)
        ).sort((a, b) => a.getTimestamp().getTime() - b.getTimestamp().getTime())
      )
    );
  }
  
  // Send a new message
  sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'read'>): Observable<Message> {
    const newMessage = {
      ...message,
      timestamp: new Date(),
      read: false
    };
    
    return this.http.post<Message>(this.apiUrl, newMessage).pipe(
      map(response => {
        const currentMessages = this.messagesSubject.getValue();
        this.messagesSubject.next([...currentMessages, response]);
        return response;
      })
    );
  }
  
  // Mark a message as read
  // markAsRead(messageId: string): Observable<Message> {
  //   return this.http.patch<Message>(`${this.apiUrl}/${messageId}`, { read: true }).pipe(
  //     map(updatedMessage => {
  //       const currentMessages = this.messagesSubject.getValue();
  //       const updatedMessages = currentMessages.map(msg => 
  //         msg.getId() === messageId ? { ...msg, read: true } : msg
  //       );
  //       this.messagesSubject.next(updatedMessages);
  //       return updatedMessage;
  //     })
  //   );
  // }
  
  // Delete a message
  deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${messageId}`).pipe(
      map(() => {
        const currentMessages = this.messagesSubject.getValue();
        const updatedMessages = currentMessages.filter(msg => msg.getId() !== messageId);
        this.messagesSubject.next(updatedMessages);
      })
    );
  }
}