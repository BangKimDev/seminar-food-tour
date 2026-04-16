import { apiClient } from './apiClient';

export interface UploadResponse {
  url: string;
  publicId: string;
  duration?: number;
}

export const uploadService = {
  async uploadAudio(
    audioBase64: string,
    filename?: string
  ): Promise<UploadResponse> {
    return apiClient.post<UploadResponse>('/upload/audio', {
      audioBase64,
      filename,
    });
  },

  async deleteAudio(publicId: string): Promise<void> {
    return apiClient.delete(`/upload/audio?publicId=${encodeURIComponent(publicId)}`);
  },

  async getConfigStatus(): Promise<{ configured: boolean; cloudName: string }> {
    return apiClient.get<{ configured: boolean; cloudName: string }>('/upload/status');
  },
};
