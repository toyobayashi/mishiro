#pragma once

//--------------------------------------------------
// HCA(High Compression Audio)クラス
//--------------------------------------------------
class clHCA {
public:
	clHCA(unsigned int ciphKey1 = 0x30DBE1AB, unsigned int ciphKey2 = 0xCC554639);

	// HCAチェック
	static bool CheckFile(void *data, unsigned int size);

	// チェックサム
	static unsigned short CheckSum(void *data, int size, unsigned short sum = 0);

	// ヘッダ情報をコンソール出力
	bool PrintInfo(const char *filenameHCA);

	// 復号化
	bool Decrypt(const char *filenameHCA);

	// デコードしてWAVEファイルに保存
	bool DecodeToWavefile(const char *filenameHCA, const char *filenameWAV, float volume = 1, int mode = 16, int loop = 0);
	bool DecodeToWavefileStream(void *fpHCA, const char *filenameWAV, float volume = 1, int mode = 16, int loop = 0);

	// エンコードしてHCAファイルに保存
	//bool EncodeFromWavefile(const char *filenameWAV,const char *filenameHCA,float volume=1);
	//bool EncodeFromWavefileStream(void *fpWAV,const char *filenameHCA,float volume=1);

private:
	struct stHeader {//ファイル情報 (必須)
		unsigned int hca;              // 'HCA'
		unsigned short version;        // バージョン。v1.3とv2.0の存在を確認
		unsigned short dataOffset;     // データオフセット
	};
	struct stFormat {//フォーマット情報 (必須)
		unsigned int fmt;              // 'fmt'
		unsigned int channelCount : 8;   // チャンネル数 1〜16
		unsigned int samplingRate : 24;  // サンプリングレート 1〜0x7FFFFF
		unsigned int blockCount;       // ブロック数 0以上
		unsigned short r01;            // 先頭の無音部分(ブロック数*0x400+0x80)
		unsigned short r02;            // 末尾の無音部分？計算方法不明(0x226)
	};
	struct stCompress {//圧縮情報 (圧縮情報かデコード情報のどちらか一つが必須)
		unsigned int comp;             // 'comp'
		unsigned short blockSize;      // ブロックサイズ(CBRのときに有効？) 8〜0xFFFF、0のときはVBR
		unsigned char r01;             // 不明(1) 0〜r02      v2.0現在1のみ対応
		unsigned char r02;             // 不明(15) r01〜0x1F  v2.0現在15のみ対応
		unsigned char r03;             // 不明(1)(1)
		unsigned char r04;             // 不明(1)(0)
		unsigned char r05;             // 不明(0x80)(0x80)
		unsigned char r06;             // 不明(0x80)(0x20)
		unsigned char r07;             // 不明(0)(0x20)
		unsigned char r08;             // 不明(0)(8)
		unsigned char reserve1;        // 予約
		unsigned char reserve2;        // 予約
	};
	struct stDecode {//デコード情報 (圧縮情報かデコード情報のどちらか一つが必須)
		unsigned int dec;              // 'dec'
		unsigned short blockSize;      // ブロックサイズ(CBRのときに有効？) 8〜0xFFFF、0のときはVBR
		unsigned char r01;             // 不明(1) 0〜r02      v2.0現在1のみ対応
		unsigned char r02;             // 不明(15) r01〜0x1F  v2.0現在15のみ対応
		unsigned char count1;          // type0とtype1の数-1
		unsigned char count2;          // type2の数-1
		unsigned char r03 : 4;           // 不明(0)
		unsigned char r04 : 4;           // 不明(0) 0は1に修正される
		unsigned char enableCount2;    // count2を使うフラグ
	};
	struct stVBR {//可変ビットレート情報 (廃止？)
		unsigned int vbr;              // 'vbr'
		unsigned short r01;            // 不明 0〜0x1FF
		unsigned short r02;            // 不明
	};
	struct stATH {//ATHテーブル情報 (v2.0から廃止？)
		unsigned int ath;              // 'ath'
		unsigned short type;           // テーブルの種類(0:全て0 1:テーブル1)
	};
	struct stLoop {//ループ情報
		unsigned int loop;             // 'loop'
		unsigned int loopStart;        // ループ開始ブロックインデックス 0〜loopEnd
		unsigned int loopEnd;          // ループ終了ブロックインデックス loopStart〜(stFormat::blockCount-1)
		unsigned short r01;            // 不明(0x80)ループフラグ？ループ回数？
		unsigned short r02;            // 不明(0x226)
	};
	struct stCipher {//暗号テーブル情報
		unsigned int ciph;             // 'ciph'
		unsigned short type;           // 暗号化の種類(0:暗号化なし 1:鍵なし暗号化 0x38:鍵あり暗号化)
	};
	struct stRVA {//相対ボリューム調節情報
		unsigned int rva;              // 'rva'
		float volume;                  // ボリューム
	};
	struct stComment {//コメント情報
		unsigned int comm;             // 'comm'
		unsigned char len;             // コメントの長さ？
									   //char comment[];
	};
	struct stPadding {//パディング
		unsigned int pad;              // 'pad'
	};
	unsigned int _version;
	unsigned int _dataOffset;
	unsigned int _channelCount;
	unsigned int _samplingRate;
	unsigned int _blockCount;
	unsigned int _fmt_r01;
	unsigned int _fmt_r02;
	unsigned int _blockSize;
	unsigned int _comp_r01;
	unsigned int _comp_r02;
	unsigned int _comp_r03;
	unsigned int _comp_r04;
	unsigned int _comp_r05;
	unsigned int _comp_r06;
	unsigned int _comp_r07;
	unsigned int _comp_r08;
	unsigned int _comp_r09;
	unsigned int _vbr_r01;
	unsigned int _vbr_r02;
	unsigned int _ath_type;
	unsigned int _loopStart;
	unsigned int _loopEnd;
	unsigned int _loop_r01;
	unsigned int _loop_r02;
	bool _loopFlg;
	unsigned int _ciph_type;
	unsigned int _ciph_key1;
	unsigned int _ciph_key2;
	float _rva_volume;
	unsigned int _comm_len;
	char *_comm_comment;
	class clATH {
	public:
		clATH();
		bool Init(int type, unsigned int key);
		unsigned char *GetTable(void);
	private:
		unsigned char _table[0x80];
		void Init0(void);
		void Init1(unsigned int key);
	}_ath;
	class clCipher {
	public:
		clCipher();
		bool Init(int type, unsigned int key1, unsigned int key2);
		void Mask(void *data, int size);
	private:
		unsigned char _table[0x100];
		void Init0(void);
		void Init1(void);
		void Init56(unsigned int key1, unsigned int key2);
		void Init56_CreateTable(unsigned char *table, unsigned char key);
	}_cipher;
	class clData {
	public:
		clData(void *data, int size);
		int CheckBit(int bitSize);
		int GetBit(int bitSize);
		void AddBit(int bitSize);
	private:
		unsigned char *_data;
		int _size;
		int _bit;
	};
	struct stChannel {
		float block[0x80];
		float base[0x80];
		char value[0x80];
		char scale[0x80];
		char value2[8];
		int type;
		char *value3;
		unsigned int count;
		float wav1[0x80];
		float wav2[0x80];
		float wav3[0x80];
		float wave[8][0x80];
		void Decode1(clData *data, unsigned int a, int b, unsigned char *ath);
		void Decode2(clData *data);
		void Decode3(unsigned int a, unsigned int b, unsigned int c, unsigned int d);
		void Decode4(int index, unsigned int a, unsigned int b, unsigned int c);
		void Decode5(int index);
	}_channel[0x10];
	bool Decode(void *data, unsigned int size, unsigned int address);
	bool DecodeToWavefile_Decode(void *fp1, void *fp2, unsigned int address, unsigned int count, void *data, void *modeFunction);
	static void DecodeToWavefile_DecodeModeFloat(float f, void *fp);
	static void DecodeToWavefile_DecodeMode8bit(float f, void *fp);
	static void DecodeToWavefile_DecodeMode16bit(float f, void *fp);
	static void DecodeToWavefile_DecodeMode24bit(float f, void *fp);
	static void DecodeToWavefile_DecodeMode32bit(float f, void *fp);
};
